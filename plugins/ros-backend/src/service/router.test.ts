/**
 * @jest-environment node
 */

import type {
  AuthService,
  BackstageCredentials,
  BackstageUserPrincipal,
  HttpAuthService,
} from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import express from 'express';
import type { RiScIndexStore } from './riscIndexStore';
import { createRouter } from './router';

describe('createRouter', () => {
  it('returns RiScs for an entity ref', async () => {
    const riScIndexStore = createRiScIndexStore();
    const riSc1 = {
      sourceFilePath:
        'https://github.com/org/repo-1/.security/risc/risc-1.risc.yaml',
      riScId: 'risc-1',
      appliesTo: ['component:default/kv-ros-test-6'],
      lastSavedAt: '2026-05-02T08:30:00Z',
    };
    const riSc2 = {
      sourceFilePath:
        'https://github.com/org/repo-2/.security/risc/risc-7ssVK.risc.yaml',
      riScId: 'risc-7ssVK',
      appliesTo: [
        'component:default/kv-ros-test-1',
        'component:default/kv-ros-test-6',
      ],
      lastSavedAt: '2026-05-01T08:30:00Z',
    };

    jest
      .mocked(riScIndexStore.getRiScsForEntityRef)
      .mockResolvedValue([riSc1, riSc2]);

    const response = await makeRequest(
      '/riscs?entityRef=component:default/kv-ros-test-6',
      { riScIndexStore },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([riSc1, riSc2]);
  });

  it('returns RiScs for components in a system entity ref', async () => {
    const riScIndexStore = createRiScIndexStore();
    const riSc1 = {
      sourceFilePath:
        'https://github.com/org/repo-1/.security/risc/risc-1.risc.yaml',
      riScId: 'risc-1',
      appliesTo: ['component:default/kv-ros-test-6'],
      lastSavedAt: '2026-05-02T08:30:00Z',
    };
    const riSc2 = {
      sourceFilePath:
        'https://github.com/org/repo-2/.security/risc/risc-7ssVK.risc.yaml',
      riScId: 'risc-7ssVK',
      appliesTo: [
        'component:default/kv-ros-test-1',
        'component:default/kv-ros-test-6',
      ],
      lastSavedAt: '2026-05-01T08:30:00Z',
    };
    jest
      .mocked(riScIndexStore.getRiScsForEntityRef)
      .mockImplementation(async entityRef => {
        if (entityRef === 'component:default/kv-ros-test-1') {
          return [riSc2];
        }
        if (entityRef === 'component:default/kv-ros-test-6') {
          return [riSc1, riSc2];
        }

        return [];
      });
    const getEntities = jest.fn().mockResolvedValue({
      items: [
        {
          kind: 'Component',
          metadata: {
            name: 'kv-ros-test-1',
            namespace: 'default',
          },
        },
        {
          kind: 'Component',
          metadata: {
            name: 'kv-ros-test-6',
            namespace: 'default',
          },
        },
      ],
    });
    const catalogClient = { getEntities } as unknown as CatalogApi;
    const auth = createAuthService();
    const userCredentials = createUserCredentials();
    const httpAuth = createHttpAuthService(userCredentials);

    const response = await makeRequest(
      '/riscs?entityRef=system:default/kv-ros-tests',
      {
        catalogClient,
        auth,
        httpAuth,
        riScIndexStore,
      },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([riSc2, riSc1]);
    expect(auth.getPluginRequestToken).toHaveBeenCalledWith({
      onBehalfOf: userCredentials,
      targetPluginId: 'catalog',
    });
    expect(auth.getOwnServiceCredentials).not.toHaveBeenCalled();
    expect(getEntities).toHaveBeenCalledWith(
      {
        filter: {
          kind: 'Component',
          'relations.partOf': 'system:default/kv-ros-tests',
        },
        fields: ['kind', 'metadata.name', 'metadata.namespace'],
      },
      { token: 'catalog-token' },
    );
  });

  it('returns 400 when entityRef is missing', async () => {
    const response = await makeRequest('/riscs');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Query parameter "entityRef" is required',
    });
  });

  it('requires user credentials', async () => {
    const riScIndexStore = createRiScIndexStore();
    const authenticationError = new Error('Missing credentials');
    authenticationError.name = 'AuthenticationError';
    const httpAuth = createHttpAuthService();
    httpAuth.credentials.mockRejectedValue(authenticationError);

    const response = await makeRequest(
      '/riscs?entityRef=component:default/kv-ros-test-6',
      {
        httpAuth,
        riScIndexStore,
      },
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Missing credentials',
    });
    expect(httpAuth.credentials).toHaveBeenCalledWith(expect.anything(), {
      allow: ['user'],
    });
    expect(riScIndexStore.getRiScsForEntityRef).not.toHaveBeenCalled();
  });
});

async function makeRequest(
  path: string,
  options?: Partial<Parameters<typeof createRouter>[0]>,
): Promise<{ status: number; body: unknown }> {
  const router = await createRouter(createRouterOptions(options));
  const url = new URL(path, 'http://localhost');

  return new Promise(resolve => {
    const req = {
      method: 'GET',
      url: `${url.pathname}${url.search}`,
      originalUrl: `${url.pathname}${url.search}`,
      baseUrl: '',
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      headers: {},
    } as express.Request;
    let responseStatus = 200;
    const res = {
      status(status: number) {
        responseStatus = status;
        return res;
      },
      json(body: unknown) {
        resolve({
          status: responseStatus,
          body,
        });
        return res;
      },
    } as express.Response;

    const handleError = (error: unknown) => {
      const err = error as Error;
      const statusCode = err.name === 'AuthenticationError' ? 401 : 500;
      resolve({
        status: statusCode,
        body: {
          error: err.message,
        },
      });
    };

    try {
      router(req, res, error => {
        if (error) {
          handleError(error);
          return;
        }

        resolve({
          status: 404,
          body: {
            error: 'Not found',
          },
        });
      });
    } catch (error) {
      handleError(error);
    }
  });
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

function createHttpAuthService(
  credentials = createUserCredentials(),
): jest.Mocked<HttpAuthService> {
  return {
    credentials: jest.fn().mockResolvedValue(credentials),
    issueUserCookie: jest.fn().mockResolvedValue({
      expiresAt: new Date('2026-05-18T00:00:00Z'),
    }),
  } as unknown as jest.Mocked<HttpAuthService>;
}

function createUserCredentials(): BackstageCredentials<BackstageUserPrincipal> {
  return {
    $$type: '@backstage/BackstageCredentials',
    principal: {
      type: 'user',
      userEntityRef: 'user:default/alice',
    },
  };
}

function createRiScIndexStore(): RiScIndexStore {
  return {
    hasEntries: jest.fn().mockResolvedValue(false),
    getAllRiScs: jest.fn().mockResolvedValue([]),
    replaceIndex: jest.fn().mockResolvedValue(undefined),
    upsertEntry: jest.fn().mockResolvedValue(undefined),
    deleteEntry: jest.fn().mockResolvedValue(undefined),
    getRiScsForEntityRef: jest.fn().mockResolvedValue([]),
  };
}

function createRouterOptions(
  options?: Partial<Parameters<typeof createRouter>[0]>,
): Parameters<typeof createRouter>[0] {
  return {
    catalogClient: {
      getEntities: jest.fn().mockResolvedValue({ items: [] }),
    } as unknown as CatalogApi,
    auth: createAuthService(),
    httpAuth: createHttpAuthService(),
    riScIndexStore: createRiScIndexStore(),
    ...options,
  };
}
