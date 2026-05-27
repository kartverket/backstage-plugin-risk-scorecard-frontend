import { CryptoKeyPermission } from '@internal/backstage-plugin-ros-common';
import {
  KeyManagementService,
  getRiScKeyRing,
  getRiScCryptoKey,
  getRiScCryptoKeyResourceId,
} from '../services/key-management/KeyManagementService.ts';

// ─── Mock Logger ──────────────────────────────────────────────────────────────

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

// ─── Mock Fetch ───────────────────────────────────────────────────────────────

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
    headers: new Headers(),
  } as Response;
}

// ─── Helper function tests ────────────────────────────────────────────────────

describe('KeyManagementService helpers', () => {
  it('getRiScKeyRing drops last 2 segments and appends -risc-key-ring', () => {
    expect(getRiScKeyRing('spire-ros-5lmr')).toBe('spire-risc-key-ring');
    expect(getRiScKeyRing('project1-prod-test')).toBe('project1-risc-key-ring');
  });

  it('getRiScCryptoKey drops last 2 segments and appends -risc-crypto-key', () => {
    expect(getRiScCryptoKey('spire-ros-5lmr')).toBe('spire-risc-crypto-key');
    expect(getRiScCryptoKey('project1-prod-test')).toBe(
      'project1-risc-crypto-key',
    );
  });

  it('getRiScCryptoKeyResourceId constructs the full resource path', () => {
    const resourceId = getRiScCryptoKeyResourceId('spire-ros-5lmr');
    expect(resourceId).toBe(
      'projects/spire-ros-5lmr/locations/europe-north1/keyRings/spire-risc-key-ring/cryptoKeys/spire-risc-crypto-key',
    );
  });
});

// ─── Service tests ────────────────────────────────────────────────────────────

describe('KeyManagementService', () => {
  let service: KeyManagementService;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    service = new KeyManagementService({
      additionalAllowedProjectIds: [],
      logger: mockLogger as any,
      fetchFn: mockFetch,
    });
  });

  describe('validateAccessToken', () => {
    it('returns true for a valid token', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ azp: '123', aud: '123', exp: '9999999999' }),
      );

      const result = await service.validateAccessToken('valid-token');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/tokeninfo?access_token=valid-token',
      );
    });

    it('returns false for an invalid token (400 response)', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ error: 'invalid_token' }, 400),
      );

      const result = await service.validateAccessToken('bad-token');
      expect(result).toBe(false);
    });

    it('throws when fetch itself fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.validateAccessToken('token')).rejects.toThrow(
        'Failed to fetch GCP OAuth2 token information',
      );
    });
  });

  describe('fetchProjectIds', () => {
    it('returns project IDs from response', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          projects: [{ projectId: 'proj-a' }, { projectId: 'proj-b' }],
        }),
      );

      const result = await service.fetchProjectIds('token');
      expect(result).toEqual(['proj-a', 'proj-b']);
    });

    it('returns empty array when no projects', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({}));

      const result = await service.fetchProjectIds('token');
      expect(result).toEqual([]);
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({}, 403));

      await expect(service.fetchProjectIds('token')).rejects.toThrow(
        'Failed to fetch GCP project IDs',
      );
    });
  });

  describe('getGcpCryptoKeys', () => {
    it('fetches keys for production projects with permissions', async () => {
      // fetchProjectIds response
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          projects: [
            { projectId: 'project1-prod-test' },
            { projectId: 'test-project-prod-test' },
          ],
        }),
      );

      // IAM permissions for project1-prod-test
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          permissions: [
            'cloudkms.cryptoKeyVersions.useToEncrypt',
            'cloudkms.cryptoKeyVersions.useToDecrypt',
          ],
        }),
      );

      // IAM permissions for test-project-prod-test
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          permissions: ['cloudkms.cryptoKeyVersions.useToDecrypt'],
        }),
      );

      const keys = await service.getGcpCryptoKeys('token');

      expect(keys).toHaveLength(2);
      expect(keys[0].projectId).toBe('project1-prod-test');
      expect(keys[0].userPermissions).toContain(CryptoKeyPermission.ENCRYPT);
      expect(keys[0].userPermissions).toContain(CryptoKeyPermission.DECRYPT);
      expect(keys[1].projectId).toBe('test-project-prod-test');
      expect(keys[1].userPermissions).toEqual([CryptoKeyPermission.DECRYPT]);
    });

    it('filters out non-production projects', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          projects: [
            { projectId: 'project1-prod-test' },
            { projectId: 'test-project' },
          ],
        }),
      );

      // Only project1-prod-test should have IAM permissions fetched
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          permissions: ['cloudkms.cryptoKeyVersions.useToEncrypt'],
        }),
      );

      const keys = await service.getGcpCryptoKeys('token');
      expect(keys).toHaveLength(1);
      expect(keys[0].projectId).toBe('project1-prod-test');
    });

    it('includes additional allowed project IDs', async () => {
      service = new KeyManagementService({
        additionalAllowedProjectIds: ['non-prod-project'],
        logger: mockLogger as any,
        fetchFn: mockFetch,
      });

      mockFetch.mockResolvedValueOnce(
        mockResponse({
          projects: [
            { projectId: 'project1-prod-test' },
            { projectId: 'non-prod-project' },
          ],
        }),
      );

      mockFetch.mockResolvedValueOnce(
        mockResponse({
          permissions: ['cloudkms.cryptoKeyVersions.useToEncrypt'],
        }),
      );
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          permissions: ['cloudkms.cryptoKeyVersions.useToDecrypt'],
        }),
      );

      const keys = await service.getGcpCryptoKeys('token');
      expect(keys).toHaveLength(2);
      expect(keys.find(k => k.projectId === 'non-prod-project')).toBeDefined();
    });

    it('filters out keys with no permissions', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          projects: [
            { projectId: 'has-perms-prod-test' },
            { projectId: 'no-perms-prod-test' },
          ],
        }),
      );

      mockFetch.mockResolvedValueOnce(
        mockResponse({
          permissions: ['cloudkms.cryptoKeyVersions.useToEncrypt'],
        }),
      );

      // No permissions (null/empty)
      mockFetch.mockResolvedValueOnce(mockResponse({ permissions: null }));

      const keys = await service.getGcpCryptoKeys('token');
      expect(keys).toHaveLength(1);
      expect(keys[0].projectId).toBe('has-perms-prod-test');
    });

    it('throws when fetching project IDs fails', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({}, 500));

      await expect(service.getGcpCryptoKeys('token')).rejects.toThrow(
        'Failed to fetch GCP project IDs',
      );
    });

    it('throws when fetching IAM permissions fails', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          projects: [{ projectId: 'project-prod-test' }],
        }),
      );

      mockFetch.mockResolvedValueOnce(mockResponse({}, 403));

      await expect(service.getGcpCryptoKeys('token')).rejects.toThrow(
        'Failed to fetch IAM permissions',
      );
    });

    it('maps permissions correctly (encrypt only, decrypt only, both)', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          projects: [
            { projectId: 'encrypt-prod-test' },
            { projectId: 'decrypt-prod-test' },
            { projectId: 'both-prod-test' },
          ],
        }),
      );

      mockFetch.mockResolvedValueOnce(
        mockResponse({
          permissions: ['cloudkms.cryptoKeyVersions.useToEncrypt'],
        }),
      );
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          permissions: ['cloudkms.cryptoKeyVersions.useToDecrypt'],
        }),
      );
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          permissions: [
            'cloudkms.cryptoKeyVersions.useToEncrypt',
            'cloudkms.cryptoKeyVersions.useToDecrypt',
          ],
        }),
      );

      const keys = await service.getGcpCryptoKeys('token');
      expect(keys).toHaveLength(3);

      const encryptKey = keys.find(k => k.projectId === 'encrypt-prod-test')!;
      expect(encryptKey.userPermissions).toEqual([CryptoKeyPermission.ENCRYPT]);

      const decryptKey = keys.find(k => k.projectId === 'decrypt-prod-test')!;
      expect(decryptKey.userPermissions).toEqual([CryptoKeyPermission.DECRYPT]);

      const bothKey = keys.find(k => k.projectId === 'both-prod-test')!;
      expect(bothKey.userPermissions).toHaveLength(2);
      expect(bothKey.userPermissions).toContain(CryptoKeyPermission.ENCRYPT);
      expect(bothKey.userPermissions).toContain(CryptoKeyPermission.DECRYPT);
    });
  });
});
