/**
 * @jest-environment node
 */

import type { AuthService } from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import express from 'express';
import { AddressInfo } from 'net';
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

    const response = await makeRequest(
      '/riscs?entityRef=system:default/kv-ros-tests',
      {
        catalogClient,
        auth: createAuthService(),
        riScIndexStore,
      },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([riSc2, riSc1]);
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
});

async function makeRequest(
  path: string,
  options?: Partial<Parameters<typeof createRouter>[0]>,
): Promise<{ status: number; body: unknown }> {
  const app = express();
  app.use(await createRouter(createRouterOptions(options)));

  const server = await new Promise<ReturnType<typeof app.listen>>(resolve => {
    const startedServer = app.listen(0, () => resolve(startedServer));
  });

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}${path}`);

    return {
      status: response.status,
      body: await response.json(),
    };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close(error => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
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
    riScIndexStore: createRiScIndexStore(),
    ...options,
  };
}
