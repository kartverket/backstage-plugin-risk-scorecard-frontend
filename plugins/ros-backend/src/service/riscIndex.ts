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

type RepoToIndex = {
  repoRootUrl: string;
  owner: string;
  repo: string;
  defaultComponentRefs: string[];
};

type IndexableRiScFile = {
  sourceUrl: string;
  coversComponentRefs: string[];
};

type GitHubContentsEntry = {
  type: 'file' | 'dir';
  name: string;
  url: string;
};

type GitHubFileResponse = {
  content?: string;
  encoding?: string;
};

export async function buildRiskScorecardRiScIndex({
  logger,
  discovery,
  auth,
  config,
}: {
  logger: LoggerService;
  discovery: DiscoveryService;
  auth: AuthService;
  config: { getOptionalString?(key: string): string | undefined };
}): Promise<IndexableRiScFile[]> {
  const catalogToken = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });

  const catalogClient = new CatalogClient({
    discoveryApi: discovery,
  });

  const filesToIndex = await getRiskScorecardRiScFilesToIndex({
    logger,
    catalogClient,
    catalogToken: catalogToken.token,
    config,
  });

  return filesToIndex;
}

async function getRiskScorecardRiScFilesToIndex({
  logger,
  catalogClient,
  catalogToken,
  config,
}: {
  logger: LoggerService;
  catalogClient: CatalogApi;
  catalogToken: string;
  config: { getOptionalString?(key: string): string | undefined };
}): Promise<IndexableRiScFile[]> {
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

  const riScFiles: IndexableRiScFile[] = [];
  const fetchStartedAt = Date.now();

  for (const repo of repos) {
    const integration = integrations.github.byUrl(repo.repoRootUrl);

    if (!integration) {
      logger.warn('Skipping repo without GitHub integration', {
        repo: repo.repoRootUrl,
        repoRootUrl: repo.repoRootUrl,
      });
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
      logger.error('Failed to index RiSc files for repo', {
        repo: repo.repoRootUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info('Finished building RiSc index', {
    repoCount: repos.length,
    analysisCount: riScFiles.length,
    fetchDurationMs: Date.now() - fetchStartedAt,
  });

  return riScFiles;
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

    const componentRef = stringifyEntityRef(entity);
    const existing = repos.get(repoInfo.repoRootUrl);

    if (!existing) {
      repos.set(repoInfo.repoRootUrl, {
        ...repoInfo,
        defaultComponentRefs: [componentRef],
      });
      continue;
    }

    if (!existing.defaultComponentRefs.includes(componentRef)) {
      existing.defaultComponentRefs.push(componentRef);
    }
  }

  return [...repos.values()];
}

function parseRepoFromCatalogInfoUrl(
  catalogInfoUrl: string,
): Omit<RepoToIndex, 'defaultComponentRefs'> | undefined {
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
}): Promise<IndexableRiScFile[]> {
  const credentials = await githubCredentialsProvider.getCredentials({
    url: repo.repoRootUrl,
  });
  const apiBaseUrl = integration.config.apiBaseUrl;
  if (!apiBaseUrl) {
    throw new Error(
      `GitHub integration for ${integration.config.host} is missing apiBaseUrl`,
    );
  }

  const directoryEntries = await fetchGitHubJsonOrUndefined<GitHubContentsEntry[]>(
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
        const fileResponse = await fetchGitHubJsonOrUndefined<GitHubFileResponse>(
          entry.url,
          credentials.headers,
        );

        if (!fileResponse?.content || fileResponse.encoding !== 'base64') {
          return undefined;
        }

        const sourceUrl = entry.url;
        const rawText = Buffer.from(fileResponse.content, 'base64').toString(
          'utf8',
        );
        const coversComponentRefs = sourceUrl.endsWith('/risc-7ssVK.risc.yaml')
          ? // TODO: Override for initial testing. Remove once proper testdata is available.
            [
              'component:default/kv-ros-test-1',
              'component:default/kv-ros-test-2',
              'component:default/kv-ros-test-3',
              'component:default/kv-ros-test-4',
              'component:default/kv-ros-test-5',
              'component:default/kv-ros-test-6',
            ]
          : parseCoversComponentRefs(rawText, sourceUrl, logger);

        return {
          sourceUrl,
          coversComponentRefs: coversComponentRefs ?? repo.defaultComponentRefs,
        };
      }),
  );

  return files.filter((file): file is IndexableRiScFile => file !== undefined);
}

async function fetchGitHubJsonOrUndefined<T>(
  url: string,
  headers?: Record<string, string>,
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
    throw new Error(`GitHub request failed for ${url}: ${response.status}`);
  }

  return (await response.json()) as T;
}

function parseCoversComponentRefs(
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

    const coversComponentRefs = root.coversComponentRefs;

    if (typeof coversComponentRefs === 'string') {
      return [coversComponentRefs];
    }

    if (coversComponentRefs === undefined) {
      return undefined;
    }

    if (
      Array.isArray(coversComponentRefs) &&
      coversComponentRefs.every(entry => typeof entry === 'string')
    ) {
      return coversComponentRefs;
    }

    logger.warn('RiSc file has invalid coversComponentRefs', {
      value: coversComponentRefs,
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
