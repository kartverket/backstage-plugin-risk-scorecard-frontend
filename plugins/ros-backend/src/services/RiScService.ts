/**
 * Core orchestrator for RiSc CRUD operations.
 *
 * Ported from the Kotlin backend:
 *   - risc/RiScService.kt (661 lines)
 *   - github/GithubRiscMetadata.kt (116 lines)
 *
 * Coordinates GitHubService, SopsCryptoService, SchemaService, and ComparisonService
 * to provide create/read/update/delete/publish/diff operations on Risk Scorecards.
 */

import type {
  ContentStatus,
  DifferenceStatus,
  MigrationStatus,
  ProcessingStatus,
  RiScStatus,
  SopsConfig,
  UserInfo,
  RiScContentResultDTO,
  CreateRiScResultDTO,
  ProcessRiScResultDTO,
  DeleteRiScResultDTO,
  PublishRiScResultDTO,
  DifferenceDTO,
  PendingApprovalDTO,
  GithubPullRequestObject,
  GithubReferenceObjectDTO,
  RiScDocument,
} from '@internal/backstage-plugin-ros-common';
import {
  DRAFT_BRANCH_PREFIX,
  RISC_FILE_PREFIX,
} from '@internal/backstage-plugin-ros-common';

import type * as ComparisonService from './ComparisonService';
import type { GitHubService, GithubContentResponse } from './GitHubService';
import { GithubStatus } from './GitHubService';
import type * as SchemaService from './SchemaService';
import type { SopsCryptoService } from './SopsCryptoService';
import type { LoggerService } from '@backstage/backend-plugin-api';

/** Metadata about a RiSc's state across GitHub branches and PRs. */
interface RiScGithubMetadata {
  id: string;
  isStoredInMain: boolean;
  hasBranch: boolean;
  hasOpenPR: boolean;
  prUrl: string | null;
  prNumber: number | null;
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

const ALPHANUMERIC =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Generates a unique RiSc ID: `risc_<5 random alphanumeric chars>`. */
export function generateRiScId(): string {
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
  }
  return `${RISC_FILE_PREFIX.replace('.', '')}${result}`;
}

/**
 * Determines RiSc status from GitHub metadata and content comparison.
 */
function getRiScStatus(
  metadata: RiScGithubMetadata,
  mainContent: GithubContentResponse,
  branchContent: GithubContentResponse,
): RiScStatus {
  const isStoredInMain = metadata.isStoredInMain;
  const hasOpenPR = metadata.hasOpenPR;

  let hasDifferentBranchContent = false;
  let branchHasNoFile = false;

  if (!metadata.hasBranch) {
    // No branch at all
  } else if (branchContent.status !== GithubStatus.Success) {
    branchHasNoFile = true;
  } else if (
    mainContent.status === GithubStatus.Success &&
    mainContent.data === branchContent.data
  ) {
    // Branch exists with same file — treated as no branch
  } else {
    hasDifferentBranchContent = true;
  }

  if (isStoredInMain) {
    if (branchHasNoFile) {
      return (
        hasOpenPR ? 'DeletionSentForApproval' : 'DeletionDraft'
      ) as RiScStatus;
    }
    if (hasDifferentBranchContent) {
      return (hasOpenPR ? 'SentForApproval' : 'Draft') as RiScStatus;
    }
    return 'Published' as RiScStatus;
  }

  if (hasDifferentBranchContent) {
    return (hasOpenPR ? 'SentForApproval' : 'Draft') as RiScStatus;
  }
  return 'Deleted' as RiScStatus;
}

/**
 * Choose which content to return based on RiSc status.
 */
function chooseContentFromStatus(
  status: RiScStatus,
  branchContent: GithubContentResponse,
  mainContent: GithubContentResponse,
): GithubContentResponse {
  switch (status) {
    case 'SentForApproval' as RiScStatus:
    case 'Draft' as RiScStatus:
      return branchContent;
    case 'Published' as RiScStatus:
    case 'DeletionDraft' as RiScStatus:
    case 'DeletionSentForApproval' as RiScStatus:
      return mainContent;
    default:
      return { data: null, status: GithubStatus.ContentIsEmpty };
  }
}

// ─── Service ───────────────────────────────────────────────────────────────────

export class RiScService {
  constructor(
    private readonly gitHubService: GitHubService,
    private readonly cryptoService: SopsCryptoService,
    private readonly schemaService: typeof SchemaService,
    private readonly comparisonService: typeof ComparisonService,
    private readonly logger?: LoggerService,
  ) {}

  // ─── Fetch All ──────────────────────────────────────────────────────────

  /**
   * Fetches all RiScs in a repository. Combines published files, draft branches,
   * and open PRs to determine status. Decrypts, validates, and migrates each.
   * Uses Promise.allSettled so one failure doesn't block the rest.
   */
  async fetchAllRiScs(
    owner: string,
    repo: string,
    latestSupportedVersion: string,
    gcpToken: string,
    githubToken: string,
  ): Promise<RiScContentResultDTO[]> {
    this.logger?.info(`Fetching all RiScs for ${owner}/${repo}`);

    // Fetch metadata in parallel
    const [publishedFiles, draftBranches, openPRs] = await Promise.all([
      this.gitHubService.fetchPublishedRiScFiles(owner, repo, githubToken),
      this.gitHubService.fetchDraftBranches(owner, repo, githubToken),
      this.gitHubService.fetchOpenPullRequests(owner, repo, githubToken),
    ]);

    // Build metadata list
    const metadata = this.buildMetadataList(
      publishedFiles,
      draftBranches,
      openPRs,
    );

    // Fetch each RiSc in parallel with allSettled
    const results = await Promise.allSettled(
      metadata.map(m =>
        this.fetchSingleRiSc(m, owner, repo, gcpToken, githubToken),
      ),
    );

    const riScResults: RiScContentResultDTO[] = results
      .map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        // On rejection, return a failure DTO
        return {
          riScId: metadata[index].id,
          status: 'Failure' as ContentStatus,
          riScStatus: null,
          riScContent: null,
          statusMessage: `Failed to fetch RiSc: ${result.reason instanceof Error ? result.reason.message : 'Unknown error'}`,
          migrationStatus: this.emptyMigrationStatus(),
        } as RiScContentResultDTO;
      })
      .filter(r => (r.riScStatus as string) !== 'Deleted');

    // Validate and migrate
    return riScResults.map(dto => {
      if (dto.status !== ('Success' as ContentStatus)) return dto;

      // Validate
      const validationResult = this.schemaService.validate(dto.riScContent!);
      if (!validationResult.valid) {
        this.logger?.warn(`RiSc ${dto.riScId} failed validation`);
        return {
          ...dto,
          status: 'SchemaValidationFailed' as ContentStatus,
          riScStatus: null,
          riScContent: null,
          statusMessage: 'Schema validation failed',
        };
      }

      // Migrate
      try {
        const doc = this.schemaService.parseContent(dto.riScContent!);
        const [migrated, migrationStatus] = this.schemaService.migrate(
          doc,
          dto.lastPublished,
          latestSupportedVersion,
        );
        return {
          ...dto,
          riScContent: JSON.stringify(migrated),
          migrationStatus,
        };
      } catch {
        return {
          ...dto,
          status: 'UnsupportedMigration' as ContentStatus,
          riScStatus: null,
          riScContent: null,
          statusMessage: 'Migration failed',
          migrationStatus: this.emptyMigrationStatus(),
        };
      }
    });
  }

  // ─── Create ─────────────────────────────────────────────────────────────

  /**
   * Creates a new RiSc: validates, encrypts, creates a draft branch, and writes the file.
   */
  async createRiSc(
    owner: string,
    repo: string,
    content: string,
    schemaVersion: string,
    sopsConfig: SopsConfig,
    gcpToken: string,
    githubToken: string,
  ): Promise<CreateRiScResultDTO> {
    const riScId = generateRiScId();

    // Validate
    const validationResult = this.schemaService.validate(
      content,
      schemaVersion,
    );
    if (!validationResult.valid) {
      return {
        riScId,
        status: 'ErrorWhenCreatingRiSc' as ProcessingStatus,
        statusMessage: `Validation failed: ${validationResult.errors?.join(', ') ?? 'Unknown error'}`,
        riScContent: null,
        sopsConfig,
      };
    }

    // Encrypt
    const encrypted = await this.cryptoService.encrypt(
      content,
      sopsConfig,
      gcpToken,
      riScId,
    );

    // Create draft branch from default branch HEAD
    const defaultBranchSha = await this.gitHubService.fetchDefaultBranchSha(
      owner,
      repo,
      githubToken,
    );
    const branchName = this.gitHubService.draftBranchName(riScId);
    await this.gitHubService.createBranch(
      owner,
      repo,
      branchName,
      defaultBranchSha,
      githubToken,
    );

    // Write file
    const filePath = this.gitHubService.riScFilePath(riScId);
    await this.gitHubService.writeFile(
      owner,
      repo,
      filePath,
      encrypted,
      `Create RiSc ${riScId}`,
      branchName,
      githubToken,
    );

    return {
      riScId,
      status: 'CreatedRiSc' as ProcessingStatus,
      statusMessage: 'New RiSc was created',
      riScContent: content,
      sopsConfig,
    };
  }

  // ─── Update ─────────────────────────────────────────────────────────────

  /**
   * Updates a RiSc: validates, encrypts, writes to draft branch.
   * Creates draft branch if it doesn't exist.
   */
  async updateRiSc(
    owner: string,
    repo: string,
    riScId: string,
    content: string,
    schemaVersion: string,
    sopsConfig: SopsConfig,
    isRequiresNewApproval: boolean,
    gcpToken: string,
    githubToken: string,
  ): Promise<ProcessRiScResultDTO | PublishRiScResultDTO> {
    // Validate
    const validationResult = this.schemaService.validate(
      content,
      schemaVersion,
    );
    if (!validationResult.valid) {
      return {
        riScId,
        status: 'ErrorWhenUpdatingRiSc' as ProcessingStatus,
        statusMessage: `Validation failed: ${validationResult.errors?.join(', ') ?? 'Unknown error'}`,
      };
    }

    // Encrypt
    const encrypted = await this.cryptoService.encrypt(
      content,
      sopsConfig,
      gcpToken,
      riScId,
    );

    // Ensure draft branch exists
    const branchName = this.gitHubService.draftBranchName(riScId);
    const branchSha = await this.gitHubService.fetchBranchHeadSha(
      owner,
      repo,
      branchName,
      githubToken,
    );

    if (!branchSha) {
      // Create new draft branch
      const defaultBranchSha = await this.gitHubService.fetchDefaultBranchSha(
        owner,
        repo,
        githubToken,
      );
      await this.gitHubService.createBranch(
        owner,
        repo,
        branchName,
        defaultBranchSha,
        githubToken,
      );
    }

    // Check existing file SHA for conflict detection
    const filePath = this.gitHubService.riScFilePath(riScId);
    const existingFile = await this.gitHubService.fetchFileInfo(
      owner,
      repo,
      filePath,
      githubToken,
      branchName,
    );

    // Write file (pass SHA for conflict detection)
    await this.gitHubService.writeFile(
      owner,
      repo,
      filePath,
      encrypted,
      `Update RiSc ${riScId}`,
      branchName,
      githubToken,
      existingFile?.sha,
    );

    // If requires new approval, close any existing PR
    if (isRequiresNewApproval) {
      const openPRs = await this.gitHubService.fetchOpenPullRequests(
        owner,
        repo,
        githubToken,
      );
      const existingPR = openPRs.find(pr => pr.head.ref === branchName);
      if (existingPR) {
        await this.gitHubService.closePullRequest(
          owner,
          repo,
          existingPR.number,
          githubToken,
        );
        return {
          riScId,
          status: 'UpdatedRiScRequiresNewApproval' as ProcessingStatus,
          statusMessage:
            'Risk scorecard was updated and has to be approved by a risk owner again',
        };
      }
    }

    return {
      riScId,
      status: 'UpdatedRiSc' as ProcessingStatus,
      statusMessage: 'Risk scorecard was updated',
    };
  }

  // ─── Delete ─────────────────────────────────────────────────────────────

  /**
   * Deletes a RiSc based on its current status:
   * - Never published (draft only): delete the branch directly
   * - Published: stage a deletion on a draft branch (requires approval)
   */
  async deleteRiSc(
    owner: string,
    repo: string,
    riScId: string,
    _gcpToken: string,
    githubToken: string,
  ): Promise<DeleteRiScResultDTO> {
    const filePath = this.gitHubService.riScFilePath(riScId);
    const branchName = this.gitHubService.draftBranchName(riScId);

    // Check if published (file exists on default branch)
    const publishedFile = await this.gitHubService.fetchFileInfo(
      owner,
      repo,
      filePath,
      githubToken,
    );

    if (!publishedFile) {
      // Never published — just delete the draft branch
      await this.gitHubService.deleteBranch(
        owner,
        repo,
        branchName,
        githubToken,
      );
      return {
        riScId,
        status: 'DeletedRiSc' as ProcessingStatus,
        statusMessage:
          'Risk scorecard was deleted - no approval required as it was never published',
      };
    }

    // Published — need to stage deletion on draft branch
    const branchSha = await this.gitHubService.fetchBranchHeadSha(
      owner,
      repo,
      branchName,
      githubToken,
    );

    let fileShaOnBranch: string;
    if (!branchSha) {
      // Create draft branch from default branch
      const defaultBranchSha = await this.gitHubService.fetchDefaultBranchSha(
        owner,
        repo,
        githubToken,
      );
      await this.gitHubService.createBranch(
        owner,
        repo,
        branchName,
        defaultBranchSha,
        githubToken,
      );
      fileShaOnBranch = publishedFile.sha;
    } else {
      // Branch exists — get file SHA from that branch
      const fileOnBranch = await this.gitHubService.fetchFileInfo(
        owner,
        repo,
        filePath,
        githubToken,
        branchName,
      );
      fileShaOnBranch = fileOnBranch?.sha ?? publishedFile.sha;
    }

    // Delete the file on the draft branch
    await this.gitHubService.deleteFile(
      owner,
      repo,
      filePath,
      fileShaOnBranch,
      `Deleted RiSc with id: ${riScId} requires new approval`,
      githubToken,
      branchName,
    );

    return {
      riScId,
      status: 'DeletedRiScRequiresApproval' as ProcessingStatus,
      statusMessage:
        'Risk scorecard was staged for deletion - the deletion requires approval',
    };
  }

  // ─── Publish ────────────────────────────────────────────────────────────

  /**
   * Creates a PR from the draft branch to the default branch for approval.
   */
  async publishRiSc(
    owner: string,
    repo: string,
    riScId: string,
    githubToken: string,
    userInfo: UserInfo,
  ): Promise<PublishRiScResultDTO> {
    const branchName = this.gitHubService.draftBranchName(riScId);

    // Verify draft branch exists
    const branchSha = await this.gitHubService.fetchBranchHeadSha(
      owner,
      repo,
      branchName,
      githubToken,
    );
    if (!branchSha) {
      return {
        riScId,
        status: 'ErrorWhenCreatingPullRequest' as ProcessingStatus,
        statusMessage: 'No draft branch found for this RiSc',
        pendingApproval: null,
      };
    }

    // Get default branch name
    const repoInfo = await this.gitHubService.fetchRepositoryInfo(
      owner,
      repo,
      githubToken,
    );

    // Create PR
    const pr = await this.gitHubService.createPullRequest(
      owner,
      repo,
      `Update RiSc ${riScId}`,
      `Approved by ${userInfo.name} (${userInfo.email})`,
      branchName,
      repoInfo.defaultBranch,
      githubToken,
    );

    return {
      riScId,
      status: 'CreatedPullRequest' as ProcessingStatus,
      statusMessage: 'Pull request was created',
      pendingApproval: this.toPendingApprovalDTO(pr),
    };
  }

  // ─── Fetch Difference ───────────────────────────────────────────────────

  /**
   * Compares draft content with published content.
   * The draft content is provided by the caller; published content is fetched from GitHub.
   */
  async fetchDifference(
    owner: string,
    repo: string,
    riScId: string,
    draftRiScContent: string,
    gcpToken: string,
    githubToken: string,
  ): Promise<DifferenceDTO> {
    const filePath = this.gitHubService.riScFilePath(riScId);

    // Fetch published content
    const publishedResponse = await this.gitHubService.fetchFileContent(
      owner,
      repo,
      filePath,
      githubToken,
    );

    if (publishedResponse.status === GithubStatus.NotFound) {
      return {
        status: 'GithubFileNotFound' as DifferenceStatus,
        differenceState: null,
        errorMessage: 'Encountered Github problem: File not found',
        defaultLastModifiedDateString: '',
      };
    }

    if (
      publishedResponse.status !== GithubStatus.Success ||
      !publishedResponse.data
    ) {
      return {
        status: 'GithubFailure' as DifferenceStatus,
        differenceState: null,
        errorMessage: 'Encountered Github problem: Github failure',
        defaultLastModifiedDateString: '',
      };
    }

    // Decrypt published content
    let decryptedPublished: { content: string; sopsConfig: SopsConfig };
    try {
      decryptedPublished = await this.cryptoService.decryptWithSopsConfig(
        publishedResponse.data,
        gcpToken,
      );
    } catch {
      return {
        status: 'DecryptionFailure' as DifferenceStatus,
        differenceState: null,
        errorMessage: 'Encountered ROS problem: Could not decrypt content',
        defaultLastModifiedDateString: '',
      };
    }

    // Compare
    try {
      const updatedDoc = this.schemaService.parseContent(
        draftRiScContent,
      ) as unknown as RiScDocument;
      const publishedDoc = this.schemaService.parseContent(
        decryptedPublished.content,
      ) as unknown as RiScDocument;

      const differenceState = this.comparisonService.compare(
        updatedDoc,
        publishedDoc,
      );

      return {
        status: 'Success' as DifferenceStatus,
        differenceState,
        errorMessage: '',
        defaultLastModifiedDateString:
          decryptedPublished.sopsConfig.lastmodified ?? '',
      };
    } catch (e) {
      this.logger?.error(
        `Comparison failed for ${riScId}: ${e instanceof Error ? e.message : e}`,
      );
      return {
        status: 'JsonFailure' as DifferenceStatus,
        differenceState: null,
        errorMessage: `Comparison failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
        defaultLastModifiedDateString:
          decryptedPublished.sopsConfig.lastmodified ?? '',
      };
    }
  }

  // ─── Private Helpers ────────────────────────────────────────────────────

  private buildMetadataList(
    publishedFiles: { name: string; sha: string }[],
    draftBranches: GithubReferenceObjectDTO[],
    openPRs: GithubPullRequestObject[],
  ): RiScGithubMetadata[] {
    const mainIds = new Set(
      publishedFiles.map(f => this.gitHubService.riScIdFromFilename(f.name)),
    );
    const branchIds = new Set(
      draftBranches.map(b => this.gitHubService.riScIdFromBranchRef(b.ref)),
    );

    // Build PR lookup from draft branches
    const prLookup = new Map<string, { url: string; number: number }>();
    for (const pr of openPRs) {
      const ref = pr.head.ref;
      if (ref.startsWith(DRAFT_BRANCH_PREFIX)) {
        const id = ref.substring(DRAFT_BRANCH_PREFIX.length);
        prLookup.set(id, { url: pr.html_url, number: pr.number });
      }
    }

    const allIds = new Set([...mainIds, ...branchIds]);

    return Array.from(allIds).map(id => ({
      id,
      isStoredInMain: mainIds.has(id),
      hasBranch: branchIds.has(id),
      hasOpenPR: prLookup.has(id),
      prUrl: prLookup.get(id)?.url ?? null,
      prNumber: prLookup.get(id)?.number ?? null,
    }));
  }

  private async fetchSingleRiSc(
    metadata: RiScGithubMetadata,
    owner: string,
    repo: string,
    gcpToken: string,
    githubToken: string,
  ): Promise<RiScContentResultDTO> {
    const filePath = this.gitHubService.riScFilePath(metadata.id);
    const branchName = this.gitHubService.draftBranchName(metadata.id);

    // Fetch content from both main and branch in parallel
    const [mainContent, branchContent] = await Promise.all([
      this.gitHubService.fetchFileContent(owner, repo, filePath, githubToken),
      metadata.hasBranch
        ? this.gitHubService.fetchFileContent(
            owner,
            repo,
            filePath,
            githubToken,
            branchName,
          )
        : Promise.resolve({
            data: null,
            status: GithubStatus.NotFound,
          } as GithubContentResponse),
    ]);

    const riScStatus = getRiScStatus(metadata, mainContent, branchContent);
    const contentToUse = chooseContentFromStatus(
      riScStatus,
      branchContent,
      mainContent,
    );

    if (contentToUse.status !== GithubStatus.Success || !contentToUse.data) {
      if (contentToUse.status === GithubStatus.NotFound) {
        return {
          riScId: metadata.id,
          status: 'FileNotFound' as ContentStatus,
          riScStatus,
          riScContent: null,
          statusMessage: 'File not found',
          migrationStatus: this.emptyMigrationStatus(),
        };
      }
      return {
        riScId: metadata.id,
        status: 'Failure' as ContentStatus,
        riScStatus,
        riScContent: null,
        statusMessage: 'Failed to fetch content from GitHub',
        migrationStatus: this.emptyMigrationStatus(),
      };
    }

    // Decrypt
    try {
      const decrypted = await this.cryptoService.decryptWithSopsConfig(
        contentToUse.data,
        gcpToken,
      );

      return {
        riScId: metadata.id,
        status: 'Success' as ContentStatus,
        riScStatus,
        riScContent: decrypted.content,
        sopsConfig: decrypted.sopsConfig,
        pullRequestUrl: metadata.prUrl,
        statusMessage: null,
        migrationStatus: this.emptyMigrationStatus(),
      };
    } catch (e) {
      return {
        riScId: metadata.id,
        status: 'DecryptionFailed' as ContentStatus,
        riScStatus,
        riScContent: null,
        statusMessage: e instanceof Error ? e.message : 'Decryption failed',
        migrationStatus: this.emptyMigrationStatus(),
      };
    }
  }

  private toPendingApprovalDTO(
    pr: GithubPullRequestObject,
  ): PendingApprovalDTO {
    return {
      pullRequestUrl: pr.html_url,
      pullRequestName: pr.head.ref,
    };
  }

  private emptyMigrationStatus(): MigrationStatus {
    return {
      migrationChanges: false,
      migrationRequiresNewApproval: false,
      migrationVersions: { fromVersion: null, toVersion: null },
    };
  }
}
