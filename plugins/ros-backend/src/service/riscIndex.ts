import {
  type AuthService,
  type DiscoveryService,
  type LoggerService,
} from '@backstage/backend-plugin-api';
import { CatalogClient, type CatalogApi } from '@backstage/catalog-client';
import {
  getEntitySourceLocation,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  DefaultGithubCredentialsProvider,
  ScmIntegrations,
  type GithubCredentialsProvider,
  type GithubIntegration,
} from '@backstage/integration';
import * as yaml from 'yaml';
import { getBackstageEntityRefFromAppliesTo } from './appliesTo';
import { type RiScIndexEntry } from './riscIndexStore';

type RepoToIndex = {
  repoRootUrl: string;
  owner: string;
  repo: string;
  defaultEntityRefs: string[];
};

type GitHubContentsEntry = {
  type: 'file' | 'dir';
  name: string;
  path: string;
  url: string;
};

type GitHubFileResponse = {
  content?: string;
  encoding?: string;
};

export const unknownRiScLastSavedAt = '1970-01-01T00:00:00Z';

export type GitHubCommitResponse = {
  commit?: {
    committer?: {
      date?: string;
    };
  };
};

export async function buildRiskScorecardRiScIndex({
  logger,
  discovery,
  auth,
  config,
  previousIndex,
}: {
  logger: LoggerService;
  discovery: DiscoveryService;
  auth: AuthService;
  config: { getOptionalString?(key: string): string | undefined };
  previousIndex?: readonly RiScIndexEntry[];
}): Promise<RiScIndexEntry[]> {
  const catalogToken = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });

  const catalogClient = new CatalogClient({
    discoveryApi: discovery,
  });

  return await getRiskScorecardRiScFilesToIndex({
    logger,
    catalogClient,
    catalogToken: catalogToken.token,
    config,
    previousIndex,
  });
}

async function getRiskScorecardRiScFilesToIndex({
  logger,
  catalogClient,
  catalogToken,
  config,
  previousIndex = [],
}: {
  logger: LoggerService;
  catalogClient: CatalogApi;
  catalogToken: string;
  config: { getOptionalString?(key: string): string | undefined };
  previousIndex?: readonly RiScIndexEntry[];
}): Promise<RiScIndexEntry[]> {
  const repos = await fetchReposToIndexFromCatalog(
    catalogClient,
    catalogToken,
    logger,
  );
  const integrations = ScmIntegrations.fromConfig(config as any);
  const githubCredentialsProvider =
    DefaultGithubCredentialsProvider.fromIntegrations(integrations);

  logger.info('Building RiSc index', {
    repoCount: repos.length,
  });

  const riScFiles: RiScIndexEntry[] = [];
  const fetchStartedAt = Date.now();
  let failedRepoCount = 0;
  let fallbackAnalysisCount = 0;

  for (const repo of repos) {
    const integration = integrations.github.byUrl(repo.repoRootUrl);
    const previousRepoFiles = getPreviousRiScFilesForRepo(previousIndex, repo);

    if (!integration) {
      failedRepoCount += 1;
      fallbackAnalysisCount += previousRepoFiles.length;
      logger.warn('Skipping repo without GitHub integration', {
        repo: repo.repoRootUrl,
        repoRootUrl: repo.repoRootUrl,
        fallbackAnalysisCount: previousRepoFiles.length,
      });
      riScFiles.push(...previousRepoFiles);
      continue;
    }

    try {
      const repoFiles = await getRiScFiles({
        repo,
        integration,
        githubCredentialsProvider,
        logger,
      });

      riScFiles.push(...repoFiles);
    } catch (error) {
      failedRepoCount += 1;
      fallbackAnalysisCount += previousRepoFiles.length;
      logger.error('Failed to index RiSc files for repo', {
        repo: repo.repoRootUrl,
        error: error instanceof Error ? error.message : String(error),
        fallbackAnalysisCount: previousRepoFiles.length,
      });
      riScFiles.push(...previousRepoFiles);
    }
  }

  logger.info('Finished building RiSc index', {
    repoCount: repos.length,
    failedRepoCount,
    fallbackAnalysisCount,
    analysisCount: riScFiles.length,
    fetchDurationMs: Date.now() - fetchStartedAt,
  });

  return riScFiles;
}

function getPreviousRiScFilesForRepo(
  previousIndex: readonly RiScIndexEntry[],
  repo: RepoToIndex,
): RiScIndexEntry[] {
  const repoSourcePathPrefix = `${repo.repoRootUrl}/`;

  return previousIndex.filter(entry =>
    entry.sourceFilePath.startsWith(repoSourcePathPrefix),
  );
}

async function fetchReposToIndexFromCatalog(
  catalogClient: CatalogApi,
  token: string,
  logger: LoggerService,
): Promise<RepoToIndex[]> {
  const response = await catalogClient.getEntities(
    {
      filter: { kind: 'Component' },
      fields: [
        'kind',
        'metadata.name',
        'metadata.namespace',
        'metadata.annotations',
      ],
    },
    { token },
  );

  const repos = new Map<string, RepoToIndex>();

  for (const entity of response.items) {
    let sourceLocation;
    try {
      sourceLocation = getEntitySourceLocation(entity);
    } catch {
      continue;
    }

    if (sourceLocation.type !== 'url') {
      continue;
    }

    const repoInfo = parseRepoFromCatalogInfoUrl(sourceLocation.target);

    if (!repoInfo) {
      logger.warn('Skipping component with unparseable source location', {
        entityRef: stringifyEntityRef(entity),
        sourceLocation: sourceLocation.target,
      });
      continue;
    }

    const entityRef = stringifyEntityRef(entity);
    const existing = repos.get(repoInfo.repoRootUrl);

    if (!existing) {
      repos.set(repoInfo.repoRootUrl, {
        ...repoInfo,
        defaultEntityRefs: [entityRef],
      });
      continue;
    }

    if (!existing.defaultEntityRefs.includes(entityRef)) {
      existing.defaultEntityRefs.push(entityRef);
    }
  }

  return [...repos.values()].map(repo => ({
    ...repo,
    defaultEntityRefs: [...repo.defaultEntityRefs].sort(),
  }));
}

function parseRepoFromCatalogInfoUrl(
  catalogInfoUrl: string,
): Omit<RepoToIndex, 'defaultEntityRefs'> | undefined {
  try {
    const parsedUrl = new URL(catalogInfoUrl);
    const [owner, rawRepo] = parsedUrl.pathname.split('/').filter(Boolean);

    if (!owner || !rawRepo) {
      return undefined;
    }

    const repo = rawRepo.replace(/\.git$/i, '');

    return {
      repoRootUrl: `${parsedUrl.origin}/${owner}/${repo}`,
      owner,
      repo,
    };
  } catch {
    return undefined;
  }
}

async function getRiScFiles({
  repo,
  integration,
  githubCredentialsProvider,
  logger,
}: {
  repo: RepoToIndex;
  integration: GithubIntegration;
  githubCredentialsProvider: GithubCredentialsProvider;
  logger: LoggerService;
}): Promise<RiScIndexEntry[]> {
  const credentials = await githubCredentialsProvider.getCredentials({
    url: repo.repoRootUrl,
  });
  const apiBaseUrl = integration.config.apiBaseUrl;
  if (!apiBaseUrl) {
    throw new Error(
      `GitHub integration for ${integration.config.host} is missing apiBaseUrl`,
    );
  }

  const directoryEntries = await fetchGitHubJsonOrUndefined<
    GitHubContentsEntry[]
  >(
    `${apiBaseUrl}/repos/${repo.owner}/${repo.repo}/contents/.security/risc`,
    credentials.headers,
  );

  if (!directoryEntries) {
    return [];
  }

  const files = await Promise.all(
    directoryEntries
      .filter(entry => {
        return entry.type === 'file' && entry.name.endsWith('.risc.yaml');
      })
      .map(async entry => {
        const lastSavedAtPromise = fetchRiScLastSavedAt({
          apiBaseUrl,
          repo,
          filePath: entry.path,
          headers: credentials.headers,
        }).catch(error => {
          logger.warn('Failed to fetch RiSc last saved timestamp', {
            sourceUrl: entry.url,
            filePath: entry.path,
            error: error instanceof Error ? error.message : String(error),
          });
          return unknownRiScLastSavedAt;
        });

        const fileResponse =
          await fetchGitHubJsonOrUndefined<GitHubFileResponse>(
            entry.url,
            credentials.headers,
          );

        if (!fileResponse?.content || fileResponse.encoding !== 'base64') {
          return undefined;
        }

        const lastSavedAt = await lastSavedAtPromise;
        const sourceUrl = entry.url;
        const riScId = getRiScIdFromFileName(entry.name);

        if (!riScId) {
          return undefined;
        }

        const rawText = Buffer.from(fileResponse.content, 'base64').toString(
          'utf8',
        );
        const appliesTo = parseAppliesTo(rawText, sourceUrl, logger);

        return {
          sourceFilePath: getSourceFilePath(repo, entry.path),
          riScId,
          appliesTo: appliesTo ?? repo.defaultEntityRefs,
          lastSavedAt,
        };
      }),
  );

  return files.filter((file): file is RiScIndexEntry => file !== undefined);
}

function getSourceFilePath(repo: RepoToIndex, filePath: string): string {
  // The identity intentionally excludes branch/ref so indexing multiple branches
  // merges the same RiSc file path into one entry.
  return `${repo.repoRootUrl}/${filePath}`;
}

function getRiScIdFromFileName(fileName: string): string | undefined {
  const suffix = '.risc.yaml';

  if (!fileName.endsWith(suffix)) {
    return undefined;
  }

  return fileName.slice(0, -suffix.length);
}

async function fetchRiScLastSavedAt({
  apiBaseUrl,
  repo,
  filePath,
  headers,
}: {
  apiBaseUrl: string;
  repo: RepoToIndex;
  filePath: string;
  headers?: Record<string, string>;
}): Promise<string> {
  const query = new URLSearchParams({
    path: filePath,
    per_page: '1',
  });
  const commits = await fetchGitHubJsonOrUndefined<GitHubCommitResponse[]>(
    `${apiBaseUrl}/repos/${repo.owner}/${repo.repo}/commits?${query}`,
    headers,
  );

  const lastSavedAt = getLastSavedAtFromGitHubCommits(commits);

  if (!lastSavedAt) {
    throw new Error('GitHub commits response did not include a committer date');
  }

  return lastSavedAt;
}

export function getLastSavedAtFromGitHubCommits(
  commits: GitHubCommitResponse[] | undefined,
): string | undefined {
  const latestCommit = commits?.[0]?.commit;
  return latestCommit?.committer?.date;
}

const defaultRetries = 2;

async function fetchGitHubJsonOrUndefined<T>(
  url: string,
  headers?: Record<string, string>,
  retriesOnTransients: number = defaultRetries,
): Promise<T | undefined> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...headers,
    },
  });

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    const isTransient =
      response.status === 408 ||
      response.status === 429 ||
      response.status >= 500;

    if (retriesOnTransients > 0 && isTransient) {
      await new Promise<void>(resolve =>
        setTimeout(resolve, 2 ** (defaultRetries - retriesOnTransients) * 1000),
      );

      return await fetchGitHubJsonOrUndefined<T>(
        url,
        headers,
        retriesOnTransients - 1,
      );
    }

    throw new Error(`GitHub request failed for ${url}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function parseAppliesTo(
  rawText: string,
  sourceUrl: string,
  logger: LoggerService,
): string[] | undefined {
  try {
    const document = yaml.parseDocument(rawText);

    if (document.errors.length > 0) {
      logger.warn('RiSc file could not be parsed as YAML', {
        errors: document.errors.map(error => error.message).join('; '),
        sourceUrl,
      });
      return undefined;
    }

    const root = document.toJS();
    if (typeof root !== 'object' || root === null || Array.isArray(root)) {
      return undefined;
    }

    const appliesTo = root.appliesTo;

    if (appliesTo === undefined) {
      return undefined;
    }

    if (
      Array.isArray(appliesTo) &&
      appliesTo.every(entry => typeof entry === 'string')
    ) {
      return appliesTo
        .map(getBackstageEntityRefFromAppliesTo)
        .filter((entityRef): entityRef is string => !!entityRef);
    }

    logger.warn('RiSc file has invalid appliesTo', {
      value: appliesTo,
      sourceUrl,
    });
    return [];
  } catch (error) {
    logger.warn('RiSc file could not be parsed as YAML', {
      error: error instanceof Error ? error.message : String(error),
      sourceUrl,
    });
    return undefined;
  }
}
