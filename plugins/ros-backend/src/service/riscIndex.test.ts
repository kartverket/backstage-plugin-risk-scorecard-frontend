/**
 * @jest-environment node
 */

import type {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import {
  DefaultGithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';
import {
  buildRiskScorecardRiScIndex,
  getLastSavedAtFromGitHubCommits,
  parseAppliesTo,
} from './riscIndex';

jest.mock('@backstage/catalog-client', () => ({
  CatalogClient: jest.fn(),
}));

jest.mock('@backstage/integration', () => ({
  DefaultGithubCredentialsProvider: {
    fromIntegrations: jest.fn(),
  },
  ScmIntegrations: {
    fromConfig: jest.fn(),
  },
}));

describe('parseAppliesTo', () => {
  const logger = createLogger();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns decoded Backstage entity refs from appliesTo entries', () => {
    expect(
      parseAppliesTo(
        'appliesTo:\n  - backstage:component:default/kv-ros-test-2\n  - service:example-ticket-1\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toEqual(['component:default/kv-ros-test-2']);
  });

  it('returns undefined when appliesTo is missing', () => {
    expect(
      parseAppliesTo(
        'title: test\nversion: 1\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toBeUndefined();
  });

  it('returns an empty array and warns when appliesTo has an invalid type', () => {
    expect(
      parseAppliesTo(
        'appliesTo:\n  invalid: true\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      'RiSc file has invalid appliesTo',
      expect.objectContaining({
        sourceUrl: 'https://example.org/risc.risc.yaml',
      }),
    );
  });
});

describe('getLastSavedAtFromGitHubCommits', () => {
  it('uses the latest commit committer date', () => {
    expect(
      getLastSavedAtFromGitHubCommits([
        {
          commit: {
            committer: { date: '2026-05-01T08:30:00Z' },
          },
        },
      ]),
    ).toBe('2026-05-01T08:30:00Z');
  });
});

describe('buildRiskScorecardRiScIndex', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('keeps previous entries for a repo when that repo cannot be indexed', async () => {
    const logger = createLogger();
    const getEntities = jest.fn().mockResolvedValue({
      items: [
        {
          kind: 'Component',
          metadata: {
            name: 'source-1',
            namespace: 'default',
            annotations: {
              'backstage.io/source-location':
                'url:https://github.com/org/repo/blob/main/catalog-info.yaml',
            },
          },
        },
      ],
    });
    const previousRepoRiSc = {
      sourceFilePath:
        'org/repo/contents/.security/risc/risc-previous.risc.yaml',
      riScId: 'risc-previous',
      appliesTo: ['component:default/kv-ros-test-1'],
      lastSavedAt: '2026-05-01T08:30:00Z',
    };
    const otherRepoRiSc = {
      sourceFilePath:
        'org/other-repo/contents/.security/risc/risc-other.risc.yaml',
      riScId: 'risc-other',
      appliesTo: ['component:default/source-1'],
      lastSavedAt: '2026-05-02T08:30:00Z',
    };
    const previousIndex = [previousRepoRiSc, otherRepoRiSc];
    const getCredentials = jest.fn().mockResolvedValue({
      headers: { Authorization: 'Bearer token' },
    });

    (CatalogClient as unknown as jest.Mock).mockImplementation(() => ({
      getEntities,
    }));
    (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue({
      github: {
        byUrl: jest.fn().mockReturnValue({
          config: {
            apiBaseUrl: 'https://api.github.com',
            host: 'github.com',
          },
        }),
      },
    });
    (
      DefaultGithubCredentialsProvider.fromIntegrations as jest.Mock
    ).mockReturnValue({
      getCredentials,
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
    } as Response);

    await expect(
      buildRiskScorecardRiScIndex({
        logger,
        discovery: {} as DiscoveryService,
        auth: createAuthService(),
        config: {},
        previousIndex,
      }),
    ).resolves.toEqual([previousRepoRiSc]);
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to index RiSc files for repo',
      expect.objectContaining({
        repo: 'https://github.com/org/repo',
        fallbackAnalysisCount: 1,
      }),
    );
  });

  it('indexes supported RiSc branches by branch-name file and merges into the source path', async () => {
    const logger = createLogger();
    const getEntities = jest.fn().mockResolvedValue({
      items: [
        {
          kind: 'Component',
          metadata: {
            name: 'source-b',
            namespace: 'default',
            annotations: {
              'backstage.io/source-location':
                'url:https://github.com/org/repo/blob/main/catalog-info.yaml',
            },
          },
        },
        {
          kind: 'Component',
          metadata: {
            name: 'source-a',
            namespace: 'default',
            annotations: {
              'backstage.io/source-location':
                'url:https://github.com/org/repo/blob/main/catalog-info.yaml',
            },
          },
        },
      ],
    });
    const defaultFileApiUrl =
      'https://api.github.com/repos/org/repo/contents/.security/risc/risc-branch.risc.yaml';
    const branchFileApiUrl =
      'https://api.github.com/repos/org/repo/contents/.security/risc/risc-branch.risc.yaml?ref=risc-branch';
    const getCredentials = jest.fn().mockResolvedValue({
      headers: { Authorization: 'Bearer token' },
    });

    (CatalogClient as unknown as jest.Mock).mockImplementation(() => ({
      getEntities,
    }));
    (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue({
      github: {
        byUrl: jest.fn().mockReturnValue({
          config: {
            apiBaseUrl: 'https://api.github.com',
            host: 'github.com',
          },
        }),
      },
    });
    (
      DefaultGithubCredentialsProvider.fromIntegrations as jest.Mock
    ).mockReturnValue({
      getCredentials,
    });
    global.fetch = jest.fn(async (url: Parameters<typeof fetch>[0]) => {
      const requestUrl = String(url);

      if (
        requestUrl ===
        'https://api.github.com/repos/org/repo/contents/.security/risc'
      ) {
        return jsonResponse([
          {
            type: 'file',
            name: 'risc-branch.risc.yaml',
            path: '.security/risc/risc-branch.risc.yaml',
            url: defaultFileApiUrl,
          },
        ]);
      }

      if (
        requestUrl ===
        'https://api.github.com/repos/org/repo/git/matching-refs/heads/risc-'
      ) {
        return jsonResponse([
          { ref: 'refs/heads/risc-branch' },
          { ref: 'refs/heads/risc-nested/path' },
        ]);
      }

      if (requestUrl === defaultFileApiUrl) {
        return jsonResponse({
          content: Buffer.from(
            'appliesTo:\n  - backstage:component:default/default-entity\n',
          ).toString('base64'),
          encoding: 'base64',
        });
      }

      if (requestUrl === branchFileApiUrl) {
        return jsonResponse({
          content: Buffer.from(
            'appliesTo:\n  - backstage:component:default/branch-entity\n',
          ).toString('base64'),
          encoding: 'base64',
        });
      }

      if (
        requestUrl.startsWith('https://api.github.com/repos/org/repo/commits?')
      ) {
        const searchParams = new URL(requestUrl).searchParams;

        return jsonResponse([
          {
            commit: {
              committer: {
                date:
                  searchParams.get('sha') === 'risc-branch'
                    ? '2026-05-02T08:30:00Z'
                    : '2026-05-01T08:30:00Z',
              },
            },
          },
        ]);
      }

      return jsonResponse({}, 404);
    }) as typeof fetch;

    await expect(
      buildRiskScorecardRiScIndex({
        logger,
        discovery: {} as DiscoveryService,
        auth: createAuthService(),
        config: {},
      }),
    ).resolves.toEqual([
      {
        sourceFilePath:
          'org/repo/contents/.security/risc/risc-branch.risc.yaml',
        riScId: 'risc-branch',
        appliesTo: ['component:default/branch-entity'],
        lastSavedAt: '2026-05-02T08:30:00Z',
      },
    ]);

    const fetchedUrls = (global.fetch as jest.Mock).mock.calls.map(([url]) =>
      String(url),
    );
    expect(fetchedUrls).toContain(
      'https://api.github.com/repos/org/repo/git/matching-refs/heads/risc-',
    );
    expect(fetchedUrls).toContain(branchFileApiUrl);
    expect(fetchedUrls).not.toContain(
      'https://api.github.com/repos/org/repo/contents/.security/risc/risc-nested/path.risc.yaml?ref=risc-nested%2Fpath',
    );
  });

  it('keeps the default branch entry when the RiSc is deleted in its branch', async () => {
    const logger = createLogger();
    const getEntities = jest.fn().mockResolvedValue({
      items: [
        {
          kind: 'Component',
          metadata: {
            name: 'source',
            namespace: 'default',
            annotations: {
              'backstage.io/source-location':
                'url:https://github.com/org/repo/blob/main/catalog-info.yaml',
            },
          },
        },
      ],
    });
    const defaultFileApiUrl =
      'https://api.github.com/repos/org/repo/contents/.security/risc/risc-deleted.risc.yaml';
    const branchFileApiUrl =
      'https://api.github.com/repos/org/repo/contents/.security/risc/risc-deleted.risc.yaml?ref=risc-deleted';
    const getCredentials = jest.fn().mockResolvedValue({
      headers: { Authorization: 'Bearer token' },
    });

    (CatalogClient as unknown as jest.Mock).mockImplementation(() => ({
      getEntities,
    }));
    (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue({
      github: {
        byUrl: jest.fn().mockReturnValue({
          config: {
            apiBaseUrl: 'https://api.github.com',
            host: 'github.com',
          },
        }),
      },
    });
    (
      DefaultGithubCredentialsProvider.fromIntegrations as jest.Mock
    ).mockReturnValue({
      getCredentials,
    });
    global.fetch = jest.fn(async (url: Parameters<typeof fetch>[0]) => {
      const requestUrl = String(url);

      if (
        requestUrl ===
        'https://api.github.com/repos/org/repo/contents/.security/risc'
      ) {
        return jsonResponse([
          {
            type: 'file',
            name: 'risc-deleted.risc.yaml',
          },
        ]);
      }

      if (
        requestUrl ===
        'https://api.github.com/repos/org/repo/git/matching-refs/heads/risc-'
      ) {
        return jsonResponse([{ ref: 'refs/heads/risc-deleted' }]);
      }

      if (requestUrl === defaultFileApiUrl) {
        return jsonResponse({
          content: Buffer.from(
            'appliesTo:\n  - backstage:component:default/default-entity\n',
          ).toString('base64'),
          encoding: 'base64',
        });
      }

      if (
        requestUrl.startsWith('https://api.github.com/repos/org/repo/commits?')
      ) {
        return jsonResponse([
          {
            commit: {
              committer: { date: '2026-05-01T08:30:00Z' },
            },
          },
        ]);
      }

      return jsonResponse({}, 404);
    }) as typeof fetch;

    await expect(
      buildRiskScorecardRiScIndex({
        logger,
        discovery: {} as DiscoveryService,
        auth: createAuthService(),
        config: {},
      }),
    ).resolves.toEqual([
      {
        sourceFilePath:
          'org/repo/contents/.security/risc/risc-deleted.risc.yaml',
        riScId: 'risc-deleted',
        appliesTo: ['component:default/default-entity'],
        lastSavedAt: '2026-05-01T08:30:00Z',
      },
    ]);

    const fetchedUrls = (global.fetch as jest.Mock).mock.calls.map(([url]) =>
      String(url),
    );
    expect(fetchedUrls).toContain(branchFileApiUrl);
  });
});

function createLogger(): LoggerService {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(),
  } as unknown as LoggerService;
}

function createAuthService(): AuthService {
  return {
    getOwnServiceCredentials: jest.fn().mockResolvedValue({
      principal: 'risk-scorecard',
    }),
    getPluginRequestToken: jest.fn().mockResolvedValue({
      token: 'catalog-token',
    }),
  } as unknown as AuthService;
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}
