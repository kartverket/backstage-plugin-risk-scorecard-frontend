import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import * as yaml from 'yaml';
import { Decrypter } from 'age-encryption';
import {
  SopsConfig,
  AgeEntry,
  GcpKmsEntry,
} from '@internal/backstage-plugin-ros-common';
import { spawnSops } from '../lib/sops';
import {
  SopsDecryptionError,
  SopsEncryptionError,
  SopsErrorCode,
} from '../lib/errors';

// ─── Validation ───────────────────────────────────────────────────────────────

const B64_TOKEN_PATTERN = /^[-a-zA-Z0-9._~+/]+=*$/;

export function isValidGCPToken(token: string): boolean {
  return B64_TOKEN_PATTERN.test(token);
}

export function isValidAgeSecretKey(key: string): boolean {
  try {
    const decrypter = new Decrypter();
    decrypter.addIdentity(key);
    return true;
  } catch {
    return false;
  }
}

// ─── SOPS Error Parsing ───────────────────────────────────────────────────────

function parseSopsErrorCode(output: string): SopsErrorCode {
  const lower = output.toLowerCase();
  if (lower.includes('failed to get the data key')) {
    return 'MISSING_DATA_KEY';
  }
  if (lower.includes('no key could decrypt')) {
    return 'NO_MATCHING_KEY';
  }
  if (
    lower.includes('authentication failed') ||
    lower.includes('could not authenticate')
  ) {
    return 'AUTHENTICATION_FAILED';
  }
  return 'UNKNOWN';
}

// ─── SOPS Config Extraction ───────────────────────────────────────────────────

export interface SopsCryptoConfig {
  /** Age private key for backend decryption */
  agePrivateKey: string;
  /** Public key of the backend (filtered out of returned configs) */
  backendPublicKey: string;
  /** Public key of the security team (filtered out of returned configs) */
  securityTeamPublicKey: string;
  /** Public key of the security platform (filtered out of returned configs) */
  securityPlatformPublicKey: string;
}

export interface RiScWithConfig {
  content: string;
  sopsConfig: SopsConfig;
}

// ─── SopsCryptoService ────────────────────────────────────────────────────────

export class SopsCryptoService {
  constructor(private readonly config: SopsCryptoConfig) {}

  /**
   * Extracts and cleans the SOPS config from encrypted YAML content.
   * Flattens key_groups into top-level gcp_kms and age arrays,
   * filtering out backend-managed public keys.
   */
  extractSopsConfig(ciphertext: string): SopsConfig {
    const doc = yaml.parse(ciphertext);
    const sopsNode = doc?.sops;
    if (!sopsNode) {
      throw new SopsDecryptionError(
        'No sops configuration found in ciphertext',
      );
    }

    const sopsConfig = sopsNode as SopsConfig;

    // Flatten key_groups into top-level arrays, filtering out managed keys
    const flatGcpKms: GcpKmsEntry[] =
      sopsConfig.key_groups?.flatMap(kg => kg.gcp_kms ?? []) ?? [];
    const flatAge: AgeEntry[] = (
      sopsConfig.key_groups?.flatMap(kg => kg.age ?? []) ?? []
    ).filter(
      a =>
        a.recipient !== this.config.securityTeamPublicKey &&
        a.recipient !== this.config.backendPublicKey &&
        a.recipient !== this.config.securityPlatformPublicKey,
    );

    return {
      shamir_threshold: sopsConfig.shamir_threshold,
      gcp_kms: flatGcpKms.length > 0 ? flatGcpKms : sopsConfig.gcp_kms,
      age: flatAge.length > 0 ? flatAge : undefined,
      lastmodified: sopsConfig.lastmodified ?? undefined,
      version: sopsConfig.version ?? undefined,
      key_groups: [],
    };
  }

  /**
   * Decrypts ciphertext and returns the plaintext alongside extracted SOPS config.
   */
  async decryptWithSopsConfig(
    ciphertext: string,
    gcpAccessToken: string,
  ): Promise<RiScWithConfig> {
    const sopsConfig = this.extractSopsConfig(ciphertext);
    const content = await this.decrypt(
      ciphertext,
      gcpAccessToken,
      this.config.agePrivateKey,
    );
    return { content, sopsConfig };
  }

  /**
   * Decrypts SOPS-encrypted YAML content to plaintext JSON.
   */
  async decrypt(
    ciphertext: string,
    gcpAccessToken: string,
    sopsAgeKey: string,
  ): Promise<string> {
    if (!isValidGCPToken(gcpAccessToken)) {
      throw new SopsDecryptionError('Invalid GCP Token');
    }
    if (!isValidAgeSecretKey(sopsAgeKey)) {
      throw new SopsDecryptionError('Invalid age key');
    }

    const result = await spawnSops({
      args: [
        'decrypt',
        '--input-type',
        'yaml',
        '--output-type',
        'json',
        '/dev/stdin',
      ],
      env: {
        SOPS_AGE_KEY: sopsAgeKey,
        GOOGLE_OAUTH_ACCESS_TOKEN: gcpAccessToken,
      },
      stdin: ciphertext,
    });

    if (result.exitCode === 0) {
      return result.stdout;
    }

    const combinedOutput = result.stderr || result.stdout;
    const errorCode = parseSopsErrorCode(combinedOutput);
    throw new SopsDecryptionError(combinedOutput, errorCode);
  }

  /**
   * Encrypts plaintext JSON content using SOPS with the provided config.
   * Creates a temporary .sops.yaml configuration file for the encryption process.
   */
  async encrypt(
    text: string,
    config: SopsConfig,
    gcpAccessToken: string,
    riScId: string,
  ): Promise<string> {
    if (!isValidGCPToken(gcpAccessToken)) {
      throw new SopsEncryptionError('Invalid GCP Token', riScId);
    }

    // Build key groups for the SOPS config file
    const keyGroups = this.buildKeyGroups(config);

    const sopsConfigObj = {
      creation_rules: [
        {
          shamir_threshold: config.shamir_threshold,
          key_groups: keyGroups,
        },
      ],
    };

    // Write temporary config file
    const tempDir = os.tmpdir();
    const tempFileName = `sopsConfig-${crypto.randomBytes(8).toString('hex')}-${Date.now()}.yaml`;
    const tempConfigPath = path.join(tempDir, tempFileName);

    try {
      fs.writeFileSync(tempConfigPath, yaml.stringify(sopsConfigObj));

      const result = await spawnSops({
        args: [
          '--encrypt',
          '--input-type',
          'json',
          '--output-type',
          'yaml',
          '--config',
          tempConfigPath,
          '/dev/stdin',
        ],
        env: {
          GOOGLE_OAUTH_ACCESS_TOKEN: gcpAccessToken,
        },
        stdin: text,
      });

      if (result.exitCode === 0) {
        return result.stdout;
      }

      const combinedOutput = result.stderr || result.stdout;
      throw new SopsEncryptionError(
        `Failed when encrypting RiSc with ID: ${riScId}. ${combinedOutput}`,
        riScId,
      );
    } finally {
      // Clean up temp file
      try {
        fs.unlinkSync(tempConfigPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  private buildKeyGroups(config: SopsConfig): Array<Record<string, unknown>> {
    const keyGroups: Array<Record<string, unknown>> = [];

    // Group 1: GCP KMS key (required) + security team age key (if configured)
    const group1: Record<string, unknown> = {};
    if (config.gcp_kms?.[0]?.resource_id) {
      group1.gcp_kms = [{ resource_id: config.gcp_kms[0].resource_id }];
    }
    if (this.config.securityTeamPublicKey) {
      group1.age = [this.config.securityTeamPublicKey];
    }
    if (Object.keys(group1).length > 0) {
      keyGroups.push(group1);
    }

    // Group 2: Backend + security platform age keys (if configured)
    const group2Age = [
      this.config.backendPublicKey,
      this.config.securityPlatformPublicKey,
    ].filter(Boolean);
    if (group2Age.length > 0) {
      keyGroups.push({ age: group2Age });
    }

    // Group 3: Developer age keys (if any remain after filtering managed keys)
    if (config.age && config.age.length > 0) {
      const managedKeys = new Set([
        this.config.securityTeamPublicKey,
        this.config.backendPublicKey,
        this.config.securityPlatformPublicKey,
      ]);
      const developerKeys = config.age
        .map(a => a.recipient)
        .filter(k => k && !managedKeys.has(k));

      if (developerKeys.length > 0) {
        keyGroups.push({ age: developerKeys });
      }
    }

    return keyGroups;
  }
}
