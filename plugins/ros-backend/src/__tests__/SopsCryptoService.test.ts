import {
  SopsCryptoService,
  isValidGCPToken,
  isValidAgeSecretKey,
  SopsCryptoConfig,
} from '../services/SopsCryptoService';
import { SopsConfig } from '@kartverket/ros-common';

// Mock the lib/sops module
jest.mock('../lib/sops');
import { spawnSops } from '../lib/sops';

const mockSpawnSops = spawnSops as jest.MockedFunction<typeof spawnSops>;

const testConfig: SopsCryptoConfig = {
  agePrivateKey:
    'AGE-SECRET-KEY-1JXMRGWL3HYZXZPYF98YHEF0AHZR8J8J58YWAYUS8448Q9QE0AW2S3KK5GT',
  backendPublicKey:
    'age18m6cv8vklff5699waclec483sjwm0s3hxkqu637uapkukm65g4qqqfjlfm',
  securityTeamPublicKey:
    'age1t8ydajqexjzw238u6duz9h40gcaj23kfealk5r945sn8qkgvvprs6x4ele',
  securityPlatformPublicKey:
    'age1qrkc5q5nur6xpm4ldwg7z232nxkv2up84ugmctye70hlxw4chgjsg7ard3',
};

describe('SopsCryptoService', () => {
  let service: SopsCryptoService;

  beforeEach(() => {
    service = new SopsCryptoService(testConfig);
    mockSpawnSops.mockReset();
  });

  describe('decrypt', () => {
    const validToken =
      'ya29.a0AeXRPp49V58XuoU6xfdO2qWndhdnExfAt97odE9Crs5PWgXwzc9TN2xbaQyxAsY8tD';

    it('returns plaintext on successful decryption', async () => {
      mockSpawnSops.mockResolvedValue({
        exitCode: 0,
        stdout: '{"test": "decrypted"}',
        stderr: '',
      });

      const result = await service.decrypt(
        'encrypted-content',
        validToken,
        testConfig.agePrivateKey,
      );
      expect(result).toBe('{"test": "decrypted"}');
    });

    it('throws SopsDecryptionError with MISSING_DATA_KEY on data key failure', async () => {
      mockSpawnSops.mockResolvedValue({
        exitCode: 1,
        stdout: '',
        stderr: 'Failed to get the data key required to decrypt the SOPS file',
      });

      await expect(
        service.decrypt(
          'encrypted-content',
          validToken,
          testConfig.agePrivateKey,
        ),
      ).rejects.toMatchObject({
        name: 'SopsDecryptionError',
        errorCode: 'MISSING_DATA_KEY',
      });
    });

    it('throws SopsDecryptionError with NO_MATCHING_KEY when no key matches', async () => {
      mockSpawnSops.mockResolvedValue({
        exitCode: 1,
        stdout: '',
        stderr: 'no key could decrypt the data',
      });

      await expect(
        service.decrypt(
          'encrypted-content',
          validToken,
          testConfig.agePrivateKey,
        ),
      ).rejects.toMatchObject({
        name: 'SopsDecryptionError',
        errorCode: 'NO_MATCHING_KEY',
      });
    });

    it('throws SopsDecryptionError with AUTHENTICATION_FAILED on auth failure', async () => {
      mockSpawnSops.mockResolvedValue({
        exitCode: 1,
        stdout: '',
        stderr: 'authentication failed for key',
      });

      await expect(
        service.decrypt(
          'encrypted-content',
          validToken,
          testConfig.agePrivateKey,
        ),
      ).rejects.toMatchObject({
        name: 'SopsDecryptionError',
        errorCode: 'AUTHENTICATION_FAILED',
      });
    });

    it('throws SopsDecryptionError with AUTHENTICATION_FAILED on "could not authenticate"', async () => {
      mockSpawnSops.mockResolvedValue({
        exitCode: 1,
        stdout: '',
        stderr: 'could not authenticate with GCP',
      });

      await expect(
        service.decrypt(
          'encrypted-content',
          validToken,
          testConfig.agePrivateKey,
        ),
      ).rejects.toMatchObject({
        name: 'SopsDecryptionError',
        errorCode: 'AUTHENTICATION_FAILED',
      });
    });

    it('throws on invalid GCP token', async () => {
      await expect(
        service.decrypt(
          'encrypted',
          'invalid token!',
          testConfig.agePrivateKey,
        ),
      ).rejects.toThrow('Invalid GCP Token');
    });

    it('throws on invalid age key', async () => {
      await expect(
        service.decrypt('encrypted', validToken, 'not-a-valid-age-key'),
      ).rejects.toThrow('Invalid age key');
    });
  });

  describe('encrypt', () => {
    const validToken = 'ya29.validtoken123';
    const sopsConfig: SopsConfig = {
      shamir_threshold: 2,
      gcp_kms: [
        {
          resource_id:
            'projects/my-project/locations/global/keyRings/my-ring/cryptoKeys/my-key',
        },
      ],
      age: [
        {
          recipient:
            'age1g9m644t5s95zk6px9mh2kctajqw3guuq2alntgfqu2au6fdz85lq4uupug',
        },
      ],
    };

    it('returns encrypted content on success', async () => {
      mockSpawnSops.mockResolvedValue({
        exitCode: 0,
        stdout: 'encrypted-yaml-output',
        stderr: '',
      });

      const result = await service.encrypt(
        '{"test":"value"}',
        sopsConfig,
        validToken,
        'risc-001',
      );
      expect(result).toBe('encrypted-yaml-output');
      expect(mockSpawnSops).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.arrayContaining([
            '--unencrypted-regex',
            '^unencryptedMetadata$',
          ]),
        }),
      );
    });

    it('throws SopsEncryptionError on sops failure', async () => {
      mockSpawnSops.mockResolvedValue({
        exitCode: 1,
        stdout: '',
        stderr: 'encryption error occurred',
      });

      await expect(
        service.encrypt('{"test":"value"}', sopsConfig, validToken, 'risc-001'),
      ).rejects.toMatchObject({
        name: 'SopsEncryptionError',
        riScId: 'risc-001',
      });
    });

    it('throws on invalid GCP token', async () => {
      await expect(
        service.encrypt('{}', sopsConfig, 'bad token!', 'risc-001'),
      ).rejects.toThrow('Invalid GCP Token');
    });
  });

  describe('extractSopsConfig', () => {
    it('extracts and cleans sops config from ciphertext', () => {
      const ciphertext = [
        'data: ENC[AES256_GCM,data:test,type:str]',
        'sops:',
        '    shamir_threshold: 2',
        '    key_groups:',
        '        - gcp_kms:',
        '            - resource_id: projects/p/locations/l/keyRings/kr/cryptoKeys/ck',
        '          age:',
        `            - recipient: ${testConfig.securityTeamPublicKey}`,
        '            - recipient: age1g9m644t5s95zk6px9mh2kctajqw3guuq2alntgfqu2au6fdz85lq4uupug',
        '    lastmodified: "2024-01-01T00:00:00Z"',
        '    version: 3.9.0',
      ].join('\n');

      const result = service.extractSopsConfig(ciphertext);

      expect(result.shamir_threshold).toBe(2);
      expect(result.gcp_kms).toHaveLength(1);
      expect(result.gcp_kms![0].resource_id).toBe(
        'projects/p/locations/l/keyRings/kr/cryptoKeys/ck',
      );
      // Should filter out managed keys
      expect(result.age).toHaveLength(1);
      expect(result.age![0].recipient).toBe(
        'age1g9m644t5s95zk6px9mh2kctajqw3guuq2alntgfqu2au6fdz85lq4uupug',
      );
      expect(result.version).toBe('3.9.0');
      expect(result.key_groups).toEqual([]);
    });

    it('throws when no sops node found', () => {
      expect(() => service.extractSopsConfig('data: value\n')).toThrow(
        'No sops configuration found in ciphertext',
      );
    });
  });
});

describe('Token validation', () => {
  describe('isValidGCPToken', () => {
    it('accepts valid GCP tokens', () => {
      const validToken =
        'ya29.a0AeXRPp49V58XuoU6xfdO2qWndhdnExfAt97odE9Crs5PWgXwzc9TN2xbaQyxAsY8tD';
      expect(isValidGCPToken(validToken)).toBe(true);
    });

    it('accepts tokens with padding characters at the end', () => {
      expect(isValidGCPToken('a9B8==')).toBe(true);
    });

    it('rejects tokens with padding in the middle', () => {
      expect(isValidGCPToken('a9=B8')).toBe(false);
    });

    it('rejects tokens with invalid characters', () => {
      const invalidChars = [
        ' ',
        ',',
        '|',
        '"',
        "'",
        '(',
        ')',
        '[',
        ']',
        '{',
        '}',
      ];
      for (const c of invalidChars) {
        expect(isValidGCPToken(`a9${c}B8`)).toBe(false);
      }
    });

    it('accepts tokens with valid special characters', () => {
      const validChars = ['.', '-', '_', '~', '+', '/'];
      for (const c of validChars) {
        expect(isValidGCPToken(`a9${c}B8`)).toBe(true);
      }
    });
  });

  describe('isValidAgeSecretKey', () => {
    it('accepts valid age secret keys', () => {
      expect(
        isValidAgeSecretKey(
          'AGE-SECRET-KEY-1JXMRGWL3HYZXZPYF98YHEF0AHZR8J8J58YWAYUS8448Q9QE0AW2S3KK5GT',
        ),
      ).toBe(true);
    });

    it('rejects keys with invalid characters', () => {
      expect(isValidAgeSecretKey('not-an-age-key')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidAgeSecretKey('')).toBe(false);
    });

    it('rejects keys with checksum errors', () => {
      // Change one character to invalidate checksum
      expect(
        isValidAgeSecretKey(
          'AGE-SECRET-KEY-1KXMRGWL3HYZXZPYF98YHEF0AHZR8J8J58YWAYUS8448Q9QE0AW2S3KK5GT',
        ),
      ).toBe(false);
    });
  });
});
