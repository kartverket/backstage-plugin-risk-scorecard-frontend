/**
 * Wire-format interfaces for all API requests and responses.
 * These match the JSON shapes sent/received by the Kotlin backend.
 *
 * Ported from:
 *   - risc/models/DTOs.kt
 *   - github/models/GithubResponse.kt
 *   - github/models/GithubRequest.kt
 *   - crypto/sops/model/SopsConfig.kt
 */

import type {
  ContentStatus,
  DifferenceStatus,
  LastPublished,
  MigrationStatus,
  ProcessingStatus,
  RiScChange,
  RiScIdentifier,
  RiScStatus,
  SopsConfig,
  UserInfo,
} from './types';

// ─── RiSc API Response DTOs ────────────────────────────────────────────────────

/** Response when fetching a single RiSc's content. */
export interface RiScContentResultDTO {
  riScId: string;
  status: ContentStatus;
  riScStatus: RiScStatus | null;
  riScContent: string | null;
  lastPublished?: LastPublished | null;
  sopsConfig?: SopsConfig | null;
  pullRequestUrl?: string | null;
  statusMessage?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  migrationStatus: MigrationStatus;
}

/** Response when fetching all RiScs for a repository. */
export interface FetchAllRiScsResultDTO {
  riScIdentifiers: RiScIdentifier[];
  status: ProcessingStatus;
  statusMessage: string;
}

/** Response from create/update/delete operations. */
export interface ProcessRiScResultDTO {
  riScId: string;
  status: ProcessingStatus;
  statusMessage: string;
}

/** Response from creating a new RiSc. */
export interface CreateRiScResultDTO {
  riScId: string;
  status: ProcessingStatus;
  statusMessage: string;
  riScContent: string | null;
  sopsConfig: SopsConfig;
}

/** Response from deleting a RiSc. */
export type DeleteRiScResultDTO = ProcessRiScResultDTO;

/** Response from publishing a RiSc. */
export interface PublishRiScResultDTO {
  riScId: string;
  status: ProcessingStatus;
  statusMessage: string;
  pendingApproval: PendingApprovalDTO | null;
}

/** Pending approval information (PR details). */
export interface PendingApprovalDTO {
  pullRequestUrl: string;
  pullRequestName: string;
}

/** Response when fetching a difference/comparison. */
export interface DifferenceDTO {
  status: DifferenceStatus;
  differenceState: RiScChange | null;
  errorMessage: string;
  defaultLastModifiedDateString: string;
}

/** Response when decryption fails. */
export interface DecryptionFailureDTO {
  status: ContentStatus;
  message: string;
  errorCode?: string | null;
  errorMessage?: string | null;
}

// ─── RiSc API Request DTOs ─────────────────────────────────────────────────────

/** Request body when submitting a RiSc for create/update. */
export interface RiScWriteRequestBody {
  riSc: string;
  isRequiresNewApproval: boolean;
  schemaVersion: string;
  userInfo: UserInfo;
  sopsConfig: SopsConfig;
  defaultRiScId?: string;
}

/** Request body when computing a difference. */
export interface DifferenceRequestBody {
  riSc: string;
}

// ─── GitHub Wire Types ─────────────────────────────────────────────────────────

/** A file object from GitHub's repository content API. */
export interface GithubFileDTO {
  content?: string | null;
  sha: string;
  name: string;
}

/** Repository metadata from GitHub's get-repo API. */
export interface GithubRepositoryDTO {
  default_branch: string;
  permissions: GithubRepositoryPermissions;
}

/** User permissions on a GitHub repository. */
export interface GithubRepositoryPermissions {
  admin: boolean;
  maintain: boolean;
  push: boolean;
  triage: boolean;
  pull: boolean;
}

/** GitHub access token response (from installation token creation). */
export interface GitHubAccessTokenResponse {
  token: string;
  expires_at: string;
}

/** A Git reference object (branch or tag). */
export interface GithubReferenceObjectDTO {
  ref: string;
  url: string;
}

/** A commit object from GitHub's API. */
export interface GithubCommitObject {
  sha: string;
  url: string;
  commit: GithubCommitInformation;
}

/** Information about a specific git commit. */
export interface GithubCommitInformation {
  message: string;
  committer: GithubCommitter;
}

/** Information about the committer. */
export interface GithubCommitter {
  date: string;
  name: string;
}

/** A pull request object from GitHub's API. */
export interface GithubPullRequestObject {
  html_url: string;
  title: string;
  created_at: string;
  head: GithubPullRequestBranch;
  base: GithubPullRequestBranch;
  number: number;
}

/** A branch reference within a pull request. */
export interface GithubPullRequestBranch {
  ref: string;
}

// ─── GitHub Request Payloads ───────────────────────────────────────────────────

/** Payload for creating/updating file contents on GitHub. */
export interface GithubWriteToFilePayload {
  message: string;
  content: string;
  sha?: string | null;
  branch: string;
  committer?: GithubAuthor | null;
}

/** Payload for deleting a file on GitHub. */
export interface GithubDeleteFilePayload {
  message: string;
  sha: string;
  branch?: string | null;
  committer?: GithubAuthor | null;
}

/** Author/committer information for GitHub file operations. */
export interface GithubAuthor {
  name: string | null;
  email: string | null;
  date: string;
}

/** Payload for creating a pull request on GitHub. */
export interface GithubCreatePullRequestPayload {
  title: string;
  body: string;
  head: string;
  base: string;
}

/** Payload for creating a branch (git reference) on GitHub. */
export interface GithubCreateBranchPayload {
  ref: string;
  sha: string;
}

// ─── GCP DTOs ──────────────────────────────────────────────────────────────────

/** GCP crypto key as returned by the backend API. */
export interface GcpCryptoKeyDTO {
  projectId: string;
  keyRing: string;
  name: string;
  locations: string;
  resourceId: string;
  createdAt: string;
  userPermissions: string[];
}

/** Response from GCP project IDs fetch. */
export interface GcpProjectIdsDTO {
  gcpProjectIds: string[];
}
