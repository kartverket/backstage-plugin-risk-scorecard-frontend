import { RiScService, generateRiScId } from '../services/RiScService';
import type * as ComparisonService from '../services/ComparisonService';
import { GithubStatus } from '../services/GitHubService';
import type { GitHubService } from '../services/GitHubService';
import type * as SchemaService from '../services/SchemaService';
import type { SopsCryptoService } from '../services/SopsCryptoService';
import type {
  SopsConfig,
  GithubPullRequestObject,
  GithubFileDTO,
  MigrationStatus,
} from '@kartverket/ros-common';

// ─── Mock Factories ────────────────────────────────────────────────────────────

function mockGitHubService(): jest.Mocked<GitHubService> {
  return {
    riScFilePath: jest.fn((id: string) => `.security/risc/${id}.risc.yaml`),
    riScIdFromFilename: jest.fn((name: string) =>
      name.replace('.risc.yaml', ''),
    ),
    draftBranchName: jest.fn((id: string) => id),
    riScIdFromBranchRef: jest.fn((ref: string) =>
      ref.substring(ref.lastIndexOf('/') + 1),
    ),
    fetchPublishedRiScFiles: jest.fn(),
    fetchFileContent: jest.fn(),
    fetchFileInfo: jest.fn(),
    writeFile: jest.fn(),
    deleteFile: jest.fn(),
    fetchDraftBranches: jest.fn(),
    fetchBranchHeadSha: jest.fn(),
    createBranch: jest.fn(),
    deleteBranch: jest.fn(),
    fetchOpenPullRequests: jest.fn(),
    createPullRequest: jest.fn(),
    closePullRequest: jest.fn(),
    fetchRepositoryInfo: jest.fn(),
    fetchDefaultBranchSha: jest.fn(),
    fetchCommits: jest.fn(),
    fetchLastPublished: jest.fn().mockResolvedValue(null),
  } as unknown as jest.Mocked<GitHubService>;
}

function mockCryptoService(): jest.Mocked<SopsCryptoService> {
  return {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    decryptWithSopsConfig: jest.fn(),
    extractSopsConfig: jest.fn(),
  } as unknown as jest.Mocked<SopsCryptoService>;
}

function mockSchemaService(): jest.Mocked<typeof SchemaService> {
  return {
    parseContent: jest.fn((content: string) => JSON.parse(content)),
    validate: jest.fn(() => ({ valid: true, version: '5.2' })),
    migrate: jest.fn((doc, _lp, _v) => [doc, emptyMigrationStatus()]),
  } as unknown as jest.Mocked<typeof SchemaService>;
}

function mockComparisonService(): jest.Mocked<typeof ComparisonService> {
  return {
    compare: jest.fn(() => ({
      type: 'unchanged',
      schemaVersion: { type: 'unchanged', value: '5.2' },
      title: { type: 'unchanged', value: 'Test' },
      scope: { type: 'unchanged', value: '' },
      scenarios: [],
      valuations: { type: 'unchanged', value: [] },
      migrationStatus: emptyMigrationStatus(),
    })),
  } as unknown as jest.Mocked<typeof ComparisonService>;
}

function emptyMigrationStatus(): MigrationStatus {
  return {
    migrationChanges: false,
    migrationRequiresNewApproval: false,
    migrationVersions: { fromVersion: null, toVersion: null },
  };
}

const SAMPLE_SOPS_CONFIG: SopsConfig = {
  shamir_threshold: 2,
  gcp_kms: [
    {
      resource_id:
        'projects/test/locations/global/keyRings/test/cryptoKeys/test',
    },
  ],
  age: [],
  key_groups: [],
};

const SAMPLE_RISC_CONTENT = JSON.stringify({
  schemaVersion: '5.2',
  title: 'Test RiSc',
  scope: 'Test scope',
  scenarios: [],
  valuations: [],
});

function makePR(branchRef: string, number: number): GithubPullRequestObject {
  return {
    html_url: `https://github.com/owner/repo/pull/${number}`,
    title: `Update RiSc`,
    created_at: '2024-01-01T00:00:00Z',
    head: { ref: branchRef },
    base: { ref: 'main' },
    number,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('RiScService', () => {
  let service: RiScService;
  let github: jest.Mocked<GitHubService>;
  let crypto: jest.Mocked<SopsCryptoService>;
  let schema: jest.Mocked<typeof SchemaService>;
  let comparison: jest.Mocked<typeof ComparisonService>;

  beforeEach(() => {
    github = mockGitHubService();
    crypto = mockCryptoService();
    schema = mockSchemaService();
    comparison = mockComparisonService();
    service = new RiScService(github, crypto, schema, comparison);
  });

  // ─── generateRiScId ──────────────────────────────────────────────────────

  describe('generateRiScId', () => {
    it('generates an ID with risc- prefix and 5 alphanumeric chars', () => {
      const id = generateRiScId();
      expect(id).toMatch(/^risc-[a-zA-Z0-9]{5}$/);
    });

    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateRiScId()));
      expect(ids.size).toBeGreaterThan(90); // Allow some collisions in 100 draws of 62^5
    });
  });

  // ─── fetchAllRiScs ───────────────────────────────────────────────────────

  describe('fetchAllRiScs', () => {
    it('returns published RiScs', async () => {
      github.fetchPublishedRiScFiles.mockResolvedValue([
        {
          name: 'risc-abc12.risc.yaml',
          sha: 'sha1',
          content: null,
        } as unknown as GithubFileDTO,
      ]);
      github.fetchDraftBranches.mockResolvedValue([]);
      github.fetchOpenPullRequests.mockResolvedValue([]);
      github.fetchFileContent.mockResolvedValue({
        data: 'encrypted-content',
        status: GithubStatus.Success,
      });
      crypto.decryptWithSopsConfig.mockResolvedValue({
        content: SAMPLE_RISC_CONTENT,
        sopsConfig: SAMPLE_SOPS_CONFIG,
      });

      const results = await service.fetchAllRiScs(
        'owner',
        'repo',
        '5.2',
        'gcp-token',
        'gh-token',
      );

      expect(results).toHaveLength(1);
      expect(results[0].riScId).toBe('risc-abc12');
      expect(results[0].riScStatus).toBe('Published');
    });

    it('returns draft RiScs', async () => {
      github.fetchPublishedRiScFiles.mockResolvedValue([]);
      github.fetchDraftBranches.mockResolvedValue([
        { ref: 'refs/heads/risc-drft1', url: '' },
      ]);
      github.fetchOpenPullRequests.mockResolvedValue([]);
      // Main returns NotFound, branch returns content
      github.fetchFileContent.mockImplementation(
        (_owner, _repo, _path, _token, ref?) => {
          if (ref === 'risc-drft1') {
            return Promise.resolve({
              data: 'encrypted',
              status: GithubStatus.Success,
            });
          }
          return Promise.resolve({ data: null, status: GithubStatus.NotFound });
        },
      );
      crypto.decryptWithSopsConfig.mockResolvedValue({
        content: SAMPLE_RISC_CONTENT,
        sopsConfig: SAMPLE_SOPS_CONFIG,
      });

      const results = await service.fetchAllRiScs(
        'owner',
        'repo',
        '5.2',
        'gcp-token',
        'gh-token',
      );

      expect(results).toHaveLength(1);
      expect(results[0].riScStatus).toBe('Draft');
    });

    it('returns SentForApproval RiScs', async () => {
      github.fetchPublishedRiScFiles.mockResolvedValue([
        {
          name: 'risc-abc12.risc.yaml',
          sha: 'sha1',
          content: null,
        } as unknown as GithubFileDTO,
      ]);
      github.fetchDraftBranches.mockResolvedValue([
        { ref: 'refs/heads/risc-abc12', url: '' },
      ]);
      github.fetchOpenPullRequests.mockResolvedValue([makePR('risc-abc12', 1)]);
      // Main and branch return different content
      github.fetchFileContent.mockImplementation(
        (_owner, _repo, _path, _token, ref?) => {
          if (ref === 'risc-abc12') {
            return Promise.resolve({
              data: 'branch-encrypted',
              status: GithubStatus.Success,
            });
          }
          return Promise.resolve({
            data: 'main-encrypted',
            status: GithubStatus.Success,
          });
        },
      );
      crypto.decryptWithSopsConfig.mockResolvedValue({
        content: SAMPLE_RISC_CONTENT,
        sopsConfig: SAMPLE_SOPS_CONFIG,
      });

      const results = await service.fetchAllRiScs(
        'owner',
        'repo',
        '5.2',
        'gcp-token',
        'gh-token',
      );

      expect(results).toHaveLength(1);
      expect(results[0].riScStatus).toBe('SentForApproval');
    });

    it('does not treat branch fetch failures as deletion drafts', async () => {
      github.fetchPublishedRiScFiles.mockResolvedValue([
        {
          name: 'risc-abc12.risc.yaml',
          sha: 'sha1',
          content: null,
        } as unknown as GithubFileDTO,
      ]);
      github.fetchDraftBranches.mockResolvedValue([
        { ref: 'refs/heads/risc-abc12', url: '' },
      ]);
      github.fetchOpenPullRequests.mockResolvedValue([]);
      github.fetchFileContent.mockImplementation(
        (_owner, _repo, _path, _token, ref?) => {
          if (ref === 'risc-abc12') {
            return Promise.resolve({
              data: null,
              status: GithubStatus.Unauthorized,
            });
          }
          return Promise.resolve({
            data: 'main-encrypted',
            status: GithubStatus.Success,
          });
        },
      );

      const results = await service.fetchAllRiScs(
        'owner',
        'repo',
        '5.2',
        'gcp-token',
        'gh-token',
      );

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('NoReadAccess');
      expect(results[0].riScStatus).toBeNull();
      expect(crypto.decryptWithSopsConfig).not.toHaveBeenCalled();
    });

    it('handles partial failures gracefully', async () => {
      github.fetchPublishedRiScFiles.mockResolvedValue([
        {
          name: 'risc-good1.risc.yaml',
          sha: 'sha1',
          content: null,
        } as unknown as GithubFileDTO,
        {
          name: 'risc-bad01.risc.yaml',
          sha: 'sha2',
          content: null,
        } as unknown as GithubFileDTO,
      ]);
      github.fetchDraftBranches.mockResolvedValue([]);
      github.fetchOpenPullRequests.mockResolvedValue([]);
      github.fetchFileContent.mockImplementation(
        (_owner, _repo, path, _token, _ref?) => {
          if (path.includes('risc-bad01')) {
            return Promise.reject(new Error('Network error'));
          }
          return Promise.resolve({
            data: 'encrypted',
            status: GithubStatus.Success,
          });
        },
      );
      crypto.decryptWithSopsConfig.mockResolvedValue({
        content: SAMPLE_RISC_CONTENT,
        sopsConfig: SAMPLE_SOPS_CONFIG,
      });

      const results = await service.fetchAllRiScs(
        'owner',
        'repo',
        '5.2',
        'gcp-token',
        'gh-token',
      );

      // Good one succeeds, bad one returns failure
      expect(results.length).toBeGreaterThanOrEqual(1);
      const good = results.find(r => r.riScId === 'risc-good1');
      const bad = results.find(r => r.riScId === 'risc-bad01');
      expect(good?.status).toBe('Success');
      expect(bad?.status).toBe('Failure');
    });

    it('filters out Deleted RiScs', async () => {
      // Branch exists but file does not (no main file either) = Deleted
      github.fetchPublishedRiScFiles.mockResolvedValue([]);
      github.fetchDraftBranches.mockResolvedValue([
        { ref: 'refs/heads/risc-delet', url: '' },
      ]);
      github.fetchOpenPullRequests.mockResolvedValue([]);
      github.fetchFileContent.mockResolvedValue({
        data: null,
        status: GithubStatus.NotFound,
      });

      const results = await service.fetchAllRiScs(
        'owner',
        'repo',
        '5.2',
        'gcp-token',
        'gh-token',
      );

      expect(results).toHaveLength(0);
    });

    it('marks validation failures', async () => {
      github.fetchPublishedRiScFiles.mockResolvedValue([
        {
          name: 'risc-inval.risc.yaml',
          sha: 'sha1',
          content: null,
        } as unknown as GithubFileDTO,
      ]);
      github.fetchDraftBranches.mockResolvedValue([]);
      github.fetchOpenPullRequests.mockResolvedValue([]);
      github.fetchFileContent.mockResolvedValue({
        data: 'encrypted',
        status: GithubStatus.Success,
      });
      crypto.decryptWithSopsConfig.mockResolvedValue({
        content: '{"invalid": true}',
        sopsConfig: SAMPLE_SOPS_CONFIG,
      });
      schema.validate.mockReturnValue({ valid: false, errors: ['bad schema'] });

      const results = await service.fetchAllRiScs(
        'owner',
        'repo',
        '5.2',
        'gcp-token',
        'gh-token',
      );

      expect(results[0].status).toBe('SchemaValidationFailed');
    });

    it('marks migration failures', async () => {
      github.fetchPublishedRiScFiles.mockResolvedValue([
        {
          name: 'risc-migfl.risc.yaml',
          sha: 'sha1',
          content: null,
        } as unknown as GithubFileDTO,
      ]);
      github.fetchDraftBranches.mockResolvedValue([]);
      github.fetchOpenPullRequests.mockResolvedValue([]);
      github.fetchFileContent.mockResolvedValue({
        data: 'encrypted',
        status: GithubStatus.Success,
      });
      crypto.decryptWithSopsConfig.mockResolvedValue({
        content: SAMPLE_RISC_CONTENT,
        sopsConfig: SAMPLE_SOPS_CONFIG,
      });
      schema.validate.mockReturnValue({ valid: true, version: '5.2' });
      schema.migrate.mockImplementation(() => {
        throw new Error('Migration unsupported');
      });

      const results = await service.fetchAllRiScs(
        'owner',
        'repo',
        '5.2',
        'gcp-token',
        'gh-token',
      );

      expect(results[0].status).toBe('UnsupportedMigration');
    });
  });

  // ─── createRiSc ──────────────────────────────────────────────────────────

  describe('createRiSc', () => {
    it('creates a new RiSc successfully', async () => {
      schema.validate.mockReturnValue({ valid: true, version: '5.2' });
      crypto.encrypt.mockResolvedValue('encrypted-content');
      github.fetchDefaultBranchSha.mockResolvedValue('abc123sha');
      github.createBranch.mockResolvedValue(undefined);
      github.writeFile.mockResolvedValue(undefined);

      const result = await service.createRiSc(
        'owner',
        'repo',
        SAMPLE_RISC_CONTENT,
        '5.2',
        SAMPLE_SOPS_CONFIG,
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('CreatedRiSc');
      expect(result.riScId).toMatch(/^risc-[a-zA-Z0-9]{5}$/);
      expect(result.riScContent).toBe(SAMPLE_RISC_CONTENT);
      expect(github.createBranch).toHaveBeenCalled();
      expect(github.writeFile).toHaveBeenCalled();
    });

    it('returns error on validation failure', async () => {
      schema.validate.mockReturnValue({
        valid: false,
        errors: ['Title is required'],
      });

      const result = await service.createRiSc(
        'owner',
        'repo',
        '{}',
        '5.2',
        SAMPLE_SOPS_CONFIG,
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('ErrorWhenCreatingRiSc');
      expect(result.statusMessage).toContain('Validation failed');
      expect(crypto.encrypt).not.toHaveBeenCalled();
    });
  });

  // ─── updateRiSc ──────────────────────────────────────────────────────────

  describe('updateRiSc', () => {
    it('updates a RiSc on existing branch', async () => {
      schema.validate.mockReturnValue({ valid: true, version: '5.2' });
      crypto.encrypt.mockResolvedValue('encrypted-updated');
      github.fetchBranchHeadSha.mockResolvedValue('branch-sha');
      github.fetchFileInfo.mockResolvedValue({
        sha: 'file-sha',
        name: 'test.yaml',
        content: null,
      } as unknown as GithubFileDTO);
      github.fetchFileContent.mockResolvedValue({
        data: SAMPLE_RISC_CONTENT,
        status: GithubStatus.Success,
      });
      github.writeFile.mockResolvedValue(undefined);
      github.fetchOpenPullRequests.mockResolvedValue([]);

      const result = await service.updateRiSc(
        'owner',
        'repo',
        'risc-abc12',
        SAMPLE_RISC_CONTENT,
        '5.2',
        SAMPLE_SOPS_CONFIG,
        false,
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('UpdatedRiSc');
      expect(github.writeFile).toHaveBeenCalledWith(
        'owner',
        'repo',
        expect.any(String),
        'encrypted-updated',
        expect.any(String),
        'risc-abc12',
        'gh-token',
        'file-sha',
      );
    });

    it('creates branch if it does not exist', async () => {
      schema.validate.mockReturnValue({ valid: true, version: '5.2' });
      crypto.encrypt.mockResolvedValue('encrypted');
      github.fetchBranchHeadSha.mockResolvedValue(null);
      github.fetchDefaultBranchSha.mockResolvedValue('default-sha');
      github.createBranch.mockResolvedValue(undefined);
      github.fetchFileInfo.mockResolvedValue(null);
      github.writeFile.mockResolvedValue(undefined);
      github.fetchOpenPullRequests.mockResolvedValue([]);

      const result = await service.updateRiSc(
        'owner',
        'repo',
        'risc-newid',
        SAMPLE_RISC_CONTENT,
        '5.2',
        SAMPLE_SOPS_CONFIG,
        false,
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('UpdatedRiSc');
      expect(github.createBranch).toHaveBeenCalledWith(
        'owner',
        'repo',
        'risc-newid',
        'default-sha',
        'gh-token',
      );
    });

    it('returns error on validation failure', async () => {
      schema.validate.mockReturnValue({ valid: false, errors: ['Invalid'] });

      const result = await service.updateRiSc(
        'owner',
        'repo',
        'risc-abc12',
        '{}',
        '5.2',
        SAMPLE_SOPS_CONFIG,
        false,
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('ErrorWhenUpdatingRiSc');
    });

    it('closes existing PR when requires new approval', async () => {
      schema.validate.mockReturnValue({ valid: true, version: '5.2' });
      crypto.encrypt.mockResolvedValue('encrypted');
      github.fetchBranchHeadSha.mockResolvedValue('sha');
      github.fetchFileInfo.mockResolvedValue({
        sha: 'fsha',
        name: 'f.yaml',
      } as unknown as GithubFileDTO);
      github.fetchFileContent.mockResolvedValue({
        data: SAMPLE_RISC_CONTENT,
        status: GithubStatus.Success,
      });
      github.writeFile.mockResolvedValue(undefined);
      github.fetchOpenPullRequests.mockResolvedValue([makePR('risc-abc12', 5)]);
      github.closePullRequest.mockResolvedValue(undefined);

      const result = await service.updateRiSc(
        'owner',
        'repo',
        'risc-abc12',
        SAMPLE_RISC_CONTENT,
        '5.2',
        SAMPLE_SOPS_CONFIG,
        true,
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('UpdatedRiScRequiresNewApproval');
      expect(github.closePullRequest).toHaveBeenCalledWith(
        'owner',
        'repo',
        5,
        'gh-token',
      );
    });
  });

  // ─── deleteRiSc ──────────────────────────────────────────────────────────

  describe('deleteRiSc', () => {
    it('deletes unpublished RiSc by deleting branch', async () => {
      github.fetchFileInfo.mockResolvedValue(null); // Not on default branch
      github.deleteBranch.mockResolvedValue(undefined);

      const result = await service.deleteRiSc(
        'owner',
        'repo',
        'risc-draft',
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('DeletedRiSc');
      expect(github.deleteBranch).toHaveBeenCalledWith(
        'owner',
        'repo',
        'risc-draft',
        'gh-token',
      );
    });

    it('stages deletion for published RiSc (no existing branch)', async () => {
      github.fetchFileInfo.mockImplementation(
        (_owner, _repo, _path, _token, ref?) => {
          if (!ref)
            return Promise.resolve({
              sha: 'pub-sha',
              name: 'f.yaml',
            } as unknown as GithubFileDTO);
          return Promise.resolve(null);
        },
      );
      github.fetchBranchHeadSha.mockResolvedValue(null);
      github.fetchDefaultBranchSha.mockResolvedValue('default-sha');
      github.createBranch.mockResolvedValue(undefined);
      github.deleteFile.mockResolvedValue(undefined);

      const result = await service.deleteRiSc(
        'owner',
        'repo',
        'risc-publi',
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('DeletedRiScRequiresApproval');
      expect(github.createBranch).toHaveBeenCalled();
      expect(github.deleteFile).toHaveBeenCalledWith(
        'owner',
        'repo',
        expect.any(String),
        'pub-sha',
        expect.stringContaining('Deleted RiSc'),
        'gh-token',
        'risc-publi',
      );
    });

    it('stages deletion for published RiSc (existing branch)', async () => {
      // First call (no ref) = published file, second (with ref) = file on branch
      github.fetchFileInfo.mockImplementation(
        (_owner, _repo, _path, _token, ref?) => {
          if (!ref)
            return Promise.resolve({
              sha: 'pub-sha',
              name: 'f.yaml',
            } as unknown as GithubFileDTO);
          return Promise.resolve({
            sha: 'branch-file-sha',
            name: 'f.yaml',
          } as unknown as GithubFileDTO);
        },
      );
      github.fetchBranchHeadSha.mockResolvedValue('branch-head-sha');
      github.deleteFile.mockResolvedValue(undefined);

      const result = await service.deleteRiSc(
        'owner',
        'repo',
        'risc-pubex',
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('DeletedRiScRequiresApproval');
      expect(github.createBranch).not.toHaveBeenCalled();
      expect(github.deleteFile).toHaveBeenCalledWith(
        'owner',
        'repo',
        expect.any(String),
        'branch-file-sha',
        expect.any(String),
        'gh-token',
        'risc-pubex',
      );
    });
  });

  // ─── publishRiSc ─────────────────────────────────────────────────────────

  describe('publishRiSc', () => {
    it('creates a PR from draft branch', async () => {
      github.fetchBranchHeadSha.mockResolvedValue('branch-sha');
      github.fetchRepositoryInfo.mockResolvedValue({
        defaultBranch: 'main',
        hasReadAccess: true,
        hasWriteAccess: true,
      });
      github.createPullRequest.mockResolvedValue(makePR('risc-pub01', 10));

      const result = await service.publishRiSc(
        'owner',
        'repo',
        'risc-pub01',
        'gh-token',
        { name: 'User', email: 'user@test.com' },
      );

      expect(result.status).toBe('CreatedPullRequest');
      expect(result.pendingApproval?.pullRequestUrl).toBe(
        'https://github.com/owner/repo/pull/10',
      );
      expect(result.pendingApproval?.pullRequestName).toBe('risc-pub01');
    });

    it('returns error when no draft branch exists', async () => {
      github.fetchBranchHeadSha.mockResolvedValue(null);

      const result = await service.publishRiSc(
        'owner',
        'repo',
        'risc-nopub',
        'gh-token',
        { name: 'User', email: 'user@test.com' },
      );

      expect(result.status).toBe('ErrorWhenCreatingPullRequest');
      expect(result.pendingApproval).toBeNull();
    });
  });

  // ─── fetchDifference ──────────────────────────────────────────────────────

  describe('fetchDifference', () => {
    it('returns diff on success', async () => {
      github.fetchFileContent.mockResolvedValue({
        data: 'encrypted-published',
        status: GithubStatus.Success,
      });
      crypto.decryptWithSopsConfig.mockResolvedValue({
        content: SAMPLE_RISC_CONTENT,
        sopsConfig: {
          ...SAMPLE_SOPS_CONFIG,
          lastmodified: '2024-01-01T00:00:00Z',
        },
      });

      const result = await service.fetchDifference(
        'owner',
        'repo',
        'risc-diff1',
        SAMPLE_RISC_CONTENT,
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('Success');
      expect(result.differenceState).not.toBeNull();
      expect(result.defaultLastModifiedDateString).toBe('2024-01-01T00:00:00Z');
    });

    it('returns GithubFileNotFound when published does not exist', async () => {
      github.fetchFileContent.mockResolvedValue({
        data: null,
        status: GithubStatus.NotFound,
      });

      const result = await service.fetchDifference(
        'owner',
        'repo',
        'risc-new01',
        SAMPLE_RISC_CONTENT,
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('GithubFileNotFound');
    });

    it('returns DecryptionFailure on decryption error', async () => {
      github.fetchFileContent.mockResolvedValue({
        data: 'encrypted',
        status: GithubStatus.Success,
      });
      crypto.decryptWithSopsConfig.mockRejectedValue(
        new Error('Decryption failed'),
      );

      const result = await service.fetchDifference(
        'owner',
        'repo',
        'risc-decrf',
        SAMPLE_RISC_CONTENT,
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('DecryptionFailure');
    });

    it('returns JsonFailure on comparison error', async () => {
      github.fetchFileContent.mockResolvedValue({
        data: 'encrypted',
        status: GithubStatus.Success,
      });
      crypto.decryptWithSopsConfig.mockResolvedValue({
        content: SAMPLE_RISC_CONTENT,
        sopsConfig: SAMPLE_SOPS_CONFIG,
      });
      comparison.compare.mockImplementation(() => {
        throw new Error('Comparison error');
      });

      const result = await service.fetchDifference(
        'owner',
        'repo',
        'risc-cmpfl',
        SAMPLE_RISC_CONTENT,
        'gcp-token',
        'gh-token',
      );

      expect(result.status).toBe('JsonFailure');
    });
  });
});
