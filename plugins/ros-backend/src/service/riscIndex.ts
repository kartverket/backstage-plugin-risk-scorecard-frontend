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
};

type GitHubFileResponse = {
  content?: string;
  encoding?: string;
};

type GitHubRefResponse = {
  ref: string;
};

export const unknownRiScLastSavedAt = '1970-01-01T00:00:00Z';
const riScBranchPrefix = 'risc-';

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

    try {
      if (!integration) {
        // noinspection ExceptionCaughtLocallyJS Used to reuse error-handling below without repeating it
        throw new Error(
          'Github-Integration was missing, this likely means that there has been added a different integration that is not yet supported',
        );
      }

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
  const repoSourcePathPrefix = `${repo.owner}/${repo.repo}/`;

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
      // getEntitySourceLocation reads annotations, and stringifyEntityRef below
      // needs kind, name, and namespace.
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

  const directoryEntries = await fetchGitHubJsonOrDefault<
    GitHubContentsEntry[]
  >({
    url: `${apiBaseUrl}/repos/${repo.owner}/${repo.repo}/contents/.security/risc`,
    headers: credentials.headers,
    defaultValue: [],
  });

  const defaultBranchFiles = await Promise.all(
    directoryEntries
      .filter(entry => {
        return entry.type === 'file' && entry.name.endsWith('.risc.yaml');
      })
      .map(entry =>
        getRiScFile({
          apiBaseUrl,
          repo,
          riScId: entry.name.replace('.risc.yaml', ''),
          headers: credentials.headers,
          logger,
        }),
      ),
  );

  const branchNames = await getRiScBranchNames({
    apiBaseUrl,
    repo,
    headers: credentials.headers,
  });
  const branchFiles = await Promise.all(
    branchNames.map(branchName =>
      getRiScFile({
        apiBaseUrl,
        repo,
        riScId: branchName,
        headers: credentials.headers,
        logger,
        ref: branchName,
      }),
    ),
  );

  return deduplicateRiScEntries(
    [...defaultBranchFiles, ...branchFiles].filter(
      (file): file is RiScIndexEntry => file !== undefined,
    ),
  );
}

async function getRiScBranchNames({
  apiBaseUrl,
  repo,
  headers,
}: {
  apiBaseUrl: string;
  repo: RepoToIndex;
  headers?: Record<string, string>;
}): Promise<string[]> {
  const refs = await fetchGitHubJsonOrDefault<GitHubRefResponse[]>({
    url: `${apiBaseUrl}/repos/${repo.owner}/${repo.repo}/git/matching-refs/heads/${riScBranchPrefix}`,
    headers,
    defaultValue: [],
  });

  return refs
    .map(({ ref }) => ref.slice('refs/heads/'.length))
    .filter((branchName): branchName is string => !branchName.includes('/'));
}

function getGitHubContentsParams({
  repo,
  riScId,
  ref,
}: {
  repo: RepoToIndex;
  riScId: string;
  ref?: string;
}): { filePath: string; sourceFilePath: string; query: string } {
  const filePath = `.security/risc/${riScId}.risc.yaml`;
  return {
    filePath,
    // SourceFilePath is also the identity of a RiSc internally, and intentionally excludes branch/ref
    // so a supported branch can replace the default-branch version of the same RiSc file in the index.
    sourceFilePath: `${repo.owner}/${repo.repo}/contents/${filePath}`,
    query: ref ? '?' + new URLSearchParams({ ref }) : '',
  };
}

async function getRiScFile(params: {
  apiBaseUrl: string;
  repo: RepoToIndex;
  riScId: string;
  ref?: string;
  headers?: Record<string, string>;
  logger: LoggerService;
}): Promise<RiScIndexEntry | undefined> {
  const { filePath, sourceFilePath, query } = getGitHubContentsParams(params);
  const fileResponse = await fetchGitHubJsonOrDefault<
    GitHubFileResponse | undefined
  >({
    url: `${params.apiBaseUrl}/repos/${sourceFilePath}${query}`,
    headers: params.headers,
    defaultValue: undefined,
  });

  if (!fileResponse?.content || fileResponse.encoding !== 'base64') {
    throw new Error(
      `Could not find content for ${sourceFilePath} in ref=${params.ref}`,
    );
  }

  const lastSavedAt = await fetchRiScLastSavedAt({
    ...params,
    filePath,
  });

  const rawText = Buffer.from(fileResponse.content, 'base64').toString('utf8');
  const appliesTo = parseAppliesTo(rawText, sourceFilePath, params.logger);

  return {
    sourceFilePath,
    riScId: params.riScId,
    appliesTo: appliesTo ?? params.repo.defaultEntityRefs,
    lastSavedAt,
  };
}

function deduplicateRiScEntries(entries: RiScIndexEntry[]): RiScIndexEntry[] {
  const entriesBySourcePath = new Map<string, RiScIndexEntry>();

  for (const entry of entries) {
    entriesBySourcePath.set(entry.sourceFilePath, entry);
  }

  return [...entriesBySourcePath.values()];
}

async function fetchRiScLastSavedAt({
  apiBaseUrl,
  repo,
  filePath,
  ref,
  headers,
  logger,
}: {
  apiBaseUrl: string;
  repo: RepoToIndex;
  filePath: string;
  ref?: string;
  headers?: Record<string, string>;
  logger: LoggerService;
}): Promise<string> {
  const query = new URLSearchParams({
    path: filePath,
    per_page: '1',
  });

  if (ref) {
    query.set('sha', ref);
  }

  const commits = await fetchGitHubJsonOrDefault<GitHubCommitResponse[]>({
    url: `${apiBaseUrl}/repos/${repo.owner}/${repo.repo}/commits?${query}`,
    headers,
    defaultValue: [],
  });

  const lastSavedAt = getLastSavedAtFromGitHubCommits(commits);

  if (!lastSavedAt) {
    logger.warn(
      `GitHub commits response did not include a committer date. Returning ${unknownRiScLastSavedAt}`,
      {
        filePath,
        ref,
      },
    );
    return unknownRiScLastSavedAt;
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

async function fetchGitHubJsonOrDefault<T>({
  url,
  headers,
  defaultValue,
  retriesOnTransients = defaultRetries,
}: {
  url: string;
  headers?: Record<string, string>;
  defaultValue: T;
  retriesOnTransients?: number;
}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...headers,
    },
  });

  if (response.status === 404) {
    return defaultValue;
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

      return await fetchGitHubJsonOrDefault<T>({
        url,
        defaultValue,
        headers,
        retriesOnTransients: retriesOnTransients - 1,
      });
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

const backstageAppliesToPrefix = 'backstage:';

function getBackstageEntityRefFromAppliesTo(
  appliesTo: string,
): string | undefined {
  if (!appliesTo.startsWith(backstageAppliesToPrefix)) {
    return undefined;
  }

  const entityRef = appliesTo.slice(backstageAppliesToPrefix.length);

  return entityRef.length > 0 ? entityRef : undefined;
}
