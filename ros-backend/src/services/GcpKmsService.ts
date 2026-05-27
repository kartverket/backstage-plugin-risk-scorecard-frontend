import type { GcpCryptoKeyObject } from '@internal/backstage-plugin-ros-common';
import { CryptoKeyPermission } from '@internal/backstage-plugin-ros-common';
import { LoggerService } from '@backstage/backend-plugin-api';

// ─── Types ────────────────────────────────────────────────────────────────────

/** GCP IAM permission identifiers for KMS operations. */
enum GcpIAMPermission {
  USE_TO_ENCRYPT = 'cloudkms.cryptoKeyVersions.useToEncrypt',
  USE_TO_DECRYPT = 'cloudkms.cryptoKeyVersions.useToDecrypt',
}

/** Response shape from Cloud Resource Manager project listing. */
interface FetchGcpProjectIdsResponse {
  projects?: Array<{ projectId: string }>;
}

/** Response shape from testIamPermissions endpoint. */
interface TestIAMPermissionsResponse {
  permissions?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KMS_LOCATION = 'europe-north1';

/**
 * Derives the RiSc key ring name from a project ID.
 * Drops the last two hyphen-separated segments and appends "-risc-key-ring".
 */
function getRiScKeyRing(projectId: string): string {
  return `${projectId.split('-').slice(0, -2).join('-')}-risc-key-ring`;
}

/**
 * Derives the RiSc crypto key name from a project ID.
 * Drops the last two hyphen-separated segments and appends "-risc-crypto-key".
 */
function getRiScCryptoKey(projectId: string): string {
  return `${projectId.split('-').slice(0, -2).join('-')}-risc-crypto-key`;
}

/** Constructs the full KMS crypto key resource ID for a project. */
function getRiScCryptoKeyResourceId(projectId: string): string {
  return `projects/${projectId}/locations/${KMS_LOCATION}/keyRings/${getRiScKeyRing(projectId)}/cryptoKeys/${getRiScCryptoKey(projectId)}`;
}

function mapIamPermission(perm: string): CryptoKeyPermission | null {
  switch (perm) {
    case GcpIAMPermission.USE_TO_ENCRYPT:
      return CryptoKeyPermission.ENCRYPT;
    case GcpIAMPermission.USE_TO_DECRYPT:
      return CryptoKeyPermission.DECRYPT;
    default:
      return null;
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
const CLOUD_RESOURCE_MANAGER_URL =
  'https://cloudresourcemanager.googleapis.com/v1/projects';
const KMS_BASE_URL = 'https://cloudkms.googleapis.com/v1';

export interface GcpKmsServiceOptions {
  additionalAllowedProjectIds: string[];
  logger: LoggerService;
  fetchFn?: typeof fetch;
}

/**
 * Service for interacting with GCP OAuth2, Cloud Resource Manager, and KMS APIs.
 * Validates access tokens, fetches project IDs, and retrieves crypto keys with permissions.
 */
export class GcpKmsService {
  private readonly additionalAllowedProjectIds: string[];
  private readonly logger: LoggerService;
  private readonly fetchFn: typeof fetch;

  constructor(options: GcpKmsServiceOptions) {
    this.additionalAllowedProjectIds = options.additionalAllowedProjectIds;
    this.logger = options.logger;
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
  }

  /**
   * Validates a GCP OAuth2 access token by calling the Google tokeninfo endpoint.
   * Returns true if the token is valid, false if it receives a 400 response.
   */
  async validateAccessToken(token: string): Promise<boolean> {
    try {
      const response = await this.fetchFn(
        `${TOKENINFO_URL}?access_token=${token}`,
      );
      return response.ok;
    } catch (e) {
      this.logger.error(
        'Failed to validate GCP access token against tokeninfo endpoint',
      );
      throw new Error(
        'Failed to fetch GCP OAuth2 token information from Google tokeninfo endpoint.',
      );
    }
  }

  /**
   * Fetches the list of GCP project IDs accessible by the given token.
   */
  async fetchProjectIds(token: string): Promise<string[]> {
    const response = await this.fetchFn(CLOUD_RESOURCE_MANAGER_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch GCP project IDs. Status: ${response.status}`,
      );
    }

    const body: FetchGcpProjectIdsResponse = await response.json();
    return (body.projects ?? []).map(p => p.projectId);
  }

  /**
   * Tests IAM permissions on a specific crypto key resource.
   * Returns the set of permissions the token holder has.
   */
  private async getIAMPermissions(
    cryptoKeyResourceId: string,
    token: string,
  ): Promise<Set<CryptoKeyPermission>> {
    const url = `${KMS_BASE_URL}/${cryptoKeyResourceId}:testIamPermissions`;
    const response = await this.fetchFn(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        permissions: [
          GcpIAMPermission.USE_TO_ENCRYPT,
          GcpIAMPermission.USE_TO_DECRYPT,
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch IAM permissions for ${cryptoKeyResourceId}. Status: ${response.status}`,
      );
    }

    const body: TestIAMPermissionsResponse = await response.json();
    const permissions = new Set<CryptoKeyPermission>();
    for (const perm of body.permissions ?? []) {
      const mapped = mapIamPermission(perm);
      if (mapped) permissions.add(mapped);
    }
    return permissions;
  }

  /**
   * Retrieves all GCP crypto keys accessible with the given token.
   * Filters projects to those containing "-prod-" or in the additional allowed list.
   * Only returns keys where the user has at least one permission.
   */
  async getGcpCryptoKeys(token: string): Promise<GcpCryptoKeyObject[]> {
    this.logger.info('Fetching GCP crypto keys');

    const projectIds = await this.fetchProjectIds(token);

    const filteredProjects = projectIds.filter(
      id =>
        id.includes('-prod-') || this.additionalAllowedProjectIds.includes(id),
    );

    const results = await Promise.all(
      filteredProjects.map(async projectId => {
        const resourceId = getRiScCryptoKeyResourceId(projectId);
        const permissions = await this.getIAMPermissions(resourceId, token);
        return {
          projectId,
          keyRing: getRiScKeyRing(projectId),
          name: getRiScCryptoKey(projectId),
          locations: KMS_LOCATION,
          resourceId,
          createdAt: '',
          userPermissions: Array.from(permissions),
        } satisfies GcpCryptoKeyObject;
      }),
    );

    return results.filter(key => key.userPermissions.length > 0);
  }
}

// Re-export helpers for testing
export {
  getRiScKeyRing,
  getRiScCryptoKey,
  getRiScCryptoKeyResourceId,
  GcpIAMPermission,
};
