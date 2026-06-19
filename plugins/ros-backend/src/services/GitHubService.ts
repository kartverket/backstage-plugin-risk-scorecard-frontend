import type {
  GithubCommitObject,
  GithubCreateBranchPayload,
  GithubCreatePullRequestPayload,
  GithubDeleteFilePayload,
  GithubFileDTO,
  GithubPullRequestObject,
  GithubReferenceObjectDTO,
  GithubRepositoryDTO,
  GithubWriteToFilePayload,
  LastPublished,
} from '@kartverket/ros-common';
import {
  RISC_DIRECTORY,
  RISC_FILE_PREFIX,
  RISC_FILE_SUFFIX,
} from '@kartverket/ros-common';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Status codes for GitHub content responses. */
export enum GithubStatus {
  Success = 'Success',
  NotFound = 'NotFound',
  Unauthorized = 'Unauthorized',
  ContentIsEmpty = 'ContentIsEmpty',
  Conflict = 'Conflict',
  RequestResponseBodyError = 'RequestResponseBodyError',
  ResponseBodyTooLarge = 'ResponseBodyTooLarge',
  InternalError = 'InternalError',
}

/** Response wrapper for fetched content. */
export interface GithubContentResponse {
  data: string | null;
  status: GithubStatus;
}

/** Repository info returned by fetchRepositoryInfo. */
export interface RepositoryInfo {
  defaultBranch: string;
  hasReadAccess: boolean;
  hasWriteAccess: boolean;
}

/** GitHub API error with HTTP status. */
export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: string,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

const GITHUB_API_BASE = 'https://api.github.com';
const TRANSIENT_GITHUB_API_STATUSES = new Set([429, 502, 503, 504]);
const DEFAULT_GET_RETRY_MAX_ATTEMPTS = 3;
const DEFAULT_GET_RETRY_INITIAL_DELAY_MS = 200;

/**
 * Low-level GitHub REST API client for repository operations.
 * All operations use token-based authorization (Bearer or `token` header).
 */
export class GitHubService {
  private readonly fetchFn: typeof fetch;
  private readonly getRetryInitialDelayMs: number;

  constructor(
    fetchFn?: typeof fetch,
    retryOptions?: {
      getInitialDelayMs?: number;
    },
  ) {
    this.fetchFn = fetchFn ?? globalThis.fetch;
    this.getRetryInitialDelayMs =
      retryOptions?.getInitialDelayMs ?? DEFAULT_GET_RETRY_INITIAL_DELAY_MS;
  }

  // ─── File Path Helpers ────────────────────────────────────────────────

  /** Constructs the file path for a RiSc file within the repository. */
  riScFilePath(riScId: string): string {
    return `${RISC_DIRECTORY}/${riScId}${RISC_FILE_SUFFIX}`;
  }

  /** Extracts the RiSc ID from a filename like `risc-7ssVK.risc.yaml`. */
  riScIdFromFilename(filename: string): string {
    return filename.replace(RISC_FILE_SUFFIX, '');
  }

  /** Returns the draft branch name for a RiSc ID. */
  draftBranchName(riScId: string): string {
    return riScId;
  }

  /** Extracts the RiSc ID from a draft branch ref like `refs/heads/risc-7ssVK`. */
  riScIdFromBranchRef(ref: string): string {
    return ref.substring(ref.lastIndexOf('/') + 1);
  }

  // ─── Core Fetch Utility ───────────────────────────────────────────────

  private async request<T>(
    method: string,
    url: string,
    token: string,
    body?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      Authorization: `token ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const sendRequest = async (): Promise<T> => {
      const response = await this.fetchFn(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new GitHubApiError(
          `GitHub API ${method} ${url} failed with status ${response.status}`,
          response.status,
          errorBody,
        );
      }

      const text = await response.text();
      if (!text) return undefined as T;
      return JSON.parse(text) as T;
    };

    if (method.toUpperCase() === 'GET') {
      return this.retryGetOnTransientError(sendRequest);
    }

    return sendRequest();
  }

  private async retryGetOnTransientError<T>(
    sendRequest: () => Promise<T>,
    retriesRemaining = DEFAULT_GET_RETRY_MAX_ATTEMPTS - 1,
    delayMs = this.getRetryInitialDelayMs,
  ): Promise<T> {
    try {
      return await sendRequest();
    } catch (e) {
      if (
        retriesRemaining &&
        e instanceof GitHubApiError &&
        TRANSIENT_GITHUB_API_STATUSES.has(e.status)
      ) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return this.retryGetOnTransientError(
          sendRequest,
          retriesRemaining - 1,
          delayMs * 2,
        );
      }

      throw e;
    }
  }

  private async requestOrNull<T>(
    method: string,
    url: string,
    token: string,
    body?: unknown,
  ): Promise<T | null> {
    try {
      return await this.request<T>(method, url, token, body);
    } catch (e) {
      if (e instanceof GitHubApiError && e.status === 404) {
        return null;
      }
      throw e;
    }
  }

  // ─── Contents API ─────────────────────────────────────────────────────

  private contentsUrl(
    owner: string,
    repo: string,
    path: string,
    ref?: string,
  ): string {
    const base = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
    return ref ? `${base}?ref=${ref}` : base;
  }

  /**
   * Lists files in the RiSc directory on the default branch.
   * Returns file DTOs matching the `.ros_*.yaml` pattern.
   */
  async fetchPublishedRiScFiles(
    owner: string,
    repo: string,
    token: string,
  ): Promise<GithubFileDTO[]> {
    try {
      const files = await this.request<GithubFileDTO[]>(
        'GET',
        this.contentsUrl(owner, repo, RISC_DIRECTORY),
        token,
      );
      return files.filter(
        f =>
          f.name.startsWith(RISC_FILE_PREFIX) &&
          f.name.endsWith(RISC_FILE_SUFFIX),
      );
    } catch (e) {
      if (
        e instanceof GitHubApiError &&
        (e.status === 404 || e.status === 409)
      ) {
        // 404: directory doesn't exist, 409: repo is empty
        return [];
      }
      throw e;
    }
  }

  /**
   * Fetches the content of a file, returning decoded string content.
   * Returns a GithubContentResponse with status indicating success or failure.
   */
  async fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    token: string,
    ref?: string,
  ): Promise<GithubContentResponse> {
    try {
      const file = await this.request<GithubFileDTO>(
        'GET',
        this.contentsUrl(owner, repo, path, ref),
        token,
      );

      if (!file.content) {
        return { data: null, status: GithubStatus.ContentIsEmpty };
      }

      const decoded = Buffer.from(
        file.content.replace(/\n/g, ''),
        'base64',
      ).toString('utf-8');
      return { data: decoded, status: GithubStatus.Success };
    } catch (e) {
      return { data: null, status: this.mapErrorToStatus(e) };
    }
  }

  /**
   * Fetches file metadata (including SHA) without decoding content.
   * Returns null if the file is not found.
   */
  async fetchFileInfo(
    owner: string,
    repo: string,
    path: string,
    token: string,
    ref?: string,
  ): Promise<GithubFileDTO | null> {
    return this.requestOrNull<GithubFileDTO>(
      'GET',
      this.contentsUrl(owner, repo, path, ref),
      token,
    );
  }

  /**
   * Creates or updates a file on a branch.
   * If sha is provided, it's an update; otherwise it's a create.
   */
  async writeFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string,
    token: string,
    sha?: string,
  ): Promise<void> {
    const payload: GithubWriteToFilePayload = {
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch,
      sha: sha ?? undefined,
    };

    await this.request<unknown>(
      'PUT',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
      token,
      payload,
    );
  }

  /**
   * Deletes a file on a branch.
   */
  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    sha: string,
    message: string,
    token: string,
    branch?: string,
  ): Promise<void> {
    const payload: GithubDeleteFilePayload = {
      message,
      sha,
      branch: branch ?? undefined,
    };

    await this.request<unknown>(
      'DELETE',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
      token,
      payload,
    );
  }

  // ─── Branches API ─────────────────────────────────────────────────────

  /**
   * Lists branches matching the RiSc ID naming pattern.
   * Returns reference objects for all `risc-*` branches.
   */
  async fetchDraftBranches(
    owner: string,
    repo: string,
    token: string,
  ): Promise<GithubReferenceObjectDTO[]> {
    try {
      return await this.request<GithubReferenceObjectDTO[]>(
        'GET',
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/matching-refs/heads/${RISC_FILE_PREFIX}`,
        token,
      );
    } catch (e) {
      if (e instanceof GitHubApiError && e.status === 404) {
        return [];
      }
      throw e;
    }
  }

  /**
   * Gets the SHA of the latest commit on a given branch.
   */
  async fetchBranchHeadSha(
    owner: string,
    repo: string,
    branch: string,
    token: string,
  ): Promise<string | null> {
    const branchInfo = await this.requestOrNull<{ commit: { sha: string } }>(
      'GET',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`,
      token,
    );
    return branchInfo?.commit.sha ?? null;
  }

  /**
   * Creates a new branch from a given SHA.
   */
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    fromSha: string,
    token: string,
  ): Promise<void> {
    const payload: GithubCreateBranchPayload = {
      ref: `refs/heads/${branchName}`,
      sha: fromSha,
    };

    await this.request<unknown>(
      'POST',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs`,
      token,
      payload,
    );
  }

  /**
   * Deletes a branch by its name.
   */
  async deleteBranch(
    owner: string,
    repo: string,
    branch: string,
    token: string,
  ): Promise<void> {
    await this.request<unknown>(
      'DELETE',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      token,
    );
  }

  // ─── Pull Requests API ────────────────────────────────────────────────

  /**
   * Fetches all open pull requests in the repository.
   */
  async fetchOpenPullRequests(
    owner: string,
    repo: string,
    token: string,
  ): Promise<GithubPullRequestObject[]> {
    try {
      return await this.request<GithubPullRequestObject[]>(
        'GET',
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=open`,
        token,
      );
    } catch (e) {
      if (e instanceof GitHubApiError && e.status === 404) {
        return [];
      }
      throw e;
    }
  }

  /**
   * Creates a pull request.
   */
  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string,
    token: string,
  ): Promise<GithubPullRequestObject> {
    const payload: GithubCreatePullRequestPayload = {
      title,
      body,
      head,
      base,
    };

    return this.request<GithubPullRequestObject>(
      'POST',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`,
      token,
      payload,
    );
  }

  /**
   * Closes a pull request by its number.
   */
  async closePullRequest(
    owner: string,
    repo: string,
    prNumber: number,
    token: string,
  ): Promise<void> {
    await this.request<unknown>(
      'PATCH',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`,
      token,
      { state: 'closed' },
    );
  }

  // ─── Repository Info ──────────────────────────────────────────────────

  /**
   * Fetches repository information including default branch and permissions.
   */
  async fetchRepositoryInfo(
    owner: string,
    repo: string,
    token: string,
  ): Promise<RepositoryInfo> {
    const dto = await this.request<GithubRepositoryDTO>(
      'GET',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      token,
    );

    return {
      defaultBranch: dto.default_branch,
      hasReadAccess: dto.permissions.pull,
      hasWriteAccess: dto.permissions.push,
    };
  }

  /**
   * Gets the SHA of the HEAD commit on the default branch.
   */
  async fetchDefaultBranchSha(
    owner: string,
    repo: string,
    token: string,
  ): Promise<string> {
    const info = await this.fetchRepositoryInfo(owner, repo, token);
    const sha = await this.fetchBranchHeadSha(
      owner,
      repo,
      info.defaultBranch,
      token,
    );
    if (!sha) {
      throw new GitHubApiError(
        `Could not determine HEAD SHA for default branch ${info.defaultBranch}`,
        500,
      );
    }
    return sha;
  }

  // ─── Commits API ──────────────────────────────────────────────────────

  /**
   * Fetches commits for the repository, with optional filters.
   */
  async fetchCommits(
    owner: string,
    repo: string,
    token: string,
    options?: {
      path?: string;
      sha?: string;
      since?: string;
      perPage?: number;
      page?: number;
    },
  ): Promise<GithubCommitObject[]> {
    const params = new URLSearchParams();
    if (options?.path) params.set('path', options.path);
    if (options?.sha) params.set('sha', options.sha);
    if (options?.since) params.set('since', options.since);
    if (options?.perPage) params.set('per_page', String(options.perPage));
    if (options?.page) params.set('page', String(options.page));

    const query = params.toString();
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits${query ? `?${query}` : ''}`;

    try {
      return await this.request<GithubCommitObject[]>('GET', url, token);
    } catch (e) {
      if (e instanceof GitHubApiError && e.status === 404) {
        return [];
      }
      throw e;
    }
  }

  /**
   * Fetches all commits using pagination (for counting purposes).
   */
  async fetchAllCommitsSince(
    owner: string,
    repo: string,
    token: string,
    since: string,
  ): Promise<GithubCommitObject[]> {
    const allCommits: GithubCommitObject[] = [];
    let page = 1;
    const perPage = 100;

    let hasMore = true;
    while (hasMore) {
      const pageCommits = await this.fetchCommits(owner, repo, token, {
        since,
        perPage,
        page,
      });
      if (pageCommits.length === 0) {
        hasMore = false;
      } else {
        allCommits.push(...pageCommits);
        if (pageCommits.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    return allCommits;
  }

  /**
   * Fetches when the RiSc file was last committed to the default branch and
   * how many commits have been made to the repo since that date.
   * Returns null if the file has never been committed or on any API error.
   */
  async fetchLastPublished(
    owner: string,
    repo: string,
    token: string,
    riScId: string,
  ): Promise<LastPublished | null> {
    try {
      const filePath = this.riScFilePath(riScId);

      // Get the most recent commit touching this file
      const [latestCommit] = await this.fetchCommits(owner, repo, token, {
        path: filePath,
        perPage: 1,
      });
      if (!latestCommit) return null;

      const lastPublishedDate = latestCommit.commit.committer.date;

      // Count all repo commits since that date
      const commitsSince = await this.fetchAllCommitsSince(
        owner,
        repo,
        token,
        lastPublishedDate,
      );

      return {
        dateTime: lastPublishedDate,
        numberOfCommits: commitsSince.filter(
          c => c.commit.committer.date > lastPublishedDate,
        ).length,
      };
    } catch {
      return null;
    }
  }

  // ─── Init Templates ───────────────────────────────────────────────────

  /**
   * Fetches file content from a template repository.
   */
  async fetchTemplateContent(
    owner: string,
    repo: string,
    path: string,
    token: string,
  ): Promise<GithubContentResponse> {
    return this.fetchFileContent(owner, repo, path, token);
  }

  // ─── Error Mapping ────────────────────────────────────────────────────

  private mapErrorToStatus(e: unknown): GithubStatus {
    if (e instanceof GitHubApiError) {
      switch (e.status) {
        case 404:
          return GithubStatus.NotFound;
        case 401:
          return GithubStatus.Unauthorized;
        case 409:
          return GithubStatus.Conflict;
        case 422:
          return GithubStatus.RequestResponseBodyError;
        default:
          return GithubStatus.InternalError;
      }
    }
    return GithubStatus.InternalError;
  }
}
