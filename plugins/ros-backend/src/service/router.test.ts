/**
 * @jest-environment node
 */

import type { AuthService } from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import express from 'express';
import { AddressInfo } from 'net';
import { riScIndexStore } from './riscIndexStore';
import { createRouter } from './router';

describe('createRouter', () => {
  it('returns RiScs for an entity ref', async () => {
    const riSc1 = {
      riScId: 'risc-1',
      sourceEntityRef: 'component:default/source-1',
      appliesToBackstageEntityRefs: ['component:default/kv-ros-test-6'],
      lastSavedAt: '2026-05-02T08:30:00Z',
    };
    const riSc2 = {
      riScId: 'risc-7ssVK',
      sourceEntityRef: 'component:default/source-2',
      appliesToBackstageEntityRefs: [
        'component:default/kv-ros-test-1',
        'component:default/kv-ros-test-6',
      ],
      lastSavedAt: '2026-05-01T08:30:00Z',
    };

    riScIndexStore.replaceSnapshot([riSc1, riSc2]);

    const response = await makeRequest(
      '/riscs?entityRef=component:default/kv-ros-test-6',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([riSc1, riSc2]);
  });

  it('returns RiScs for components in a system entity ref', async () => {
    const riSc1 = {
      riScId: 'risc-1',
      sourceEntityRef: 'component:default/source-1',
      appliesToBackstageEntityRefs: ['component:default/kv-ros-test-6'],
      lastSavedAt: '2026-05-02T08:30:00Z',
    };
    const riSc2 = {
      riScId: 'risc-7ssVK',
      sourceEntityRef: 'component:default/source-2',
      appliesToBackstageEntityRefs: [
        'component:default/kv-ros-test-1',
        'component:default/kv-ros-test-6',
      ],
      lastSavedAt: '2026-05-01T08:30:00Z',
    };
    riScIndexStore.replaceSnapshot([riSc1, riSc2]);
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
    riScIndexStore.replaceSnapshot([]);

    const response = await makeRequest('/riscs');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Query parameter "entityRef" is required',
    });
  });
});

afterEach(() => {
  riScIndexStore.replaceSnapshot([]);
});

async function makeRequest(
  path: string,
  options?: Parameters<typeof createRouter>[0],
): Promise<{ status: number; body: unknown }> {
  const app = express();
  app.use(await createRouter(options ?? createRouterOptions()));

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

function createRouterOptions(): Parameters<typeof createRouter>[0] {
  return {
    catalogClient: {
      getEntities: jest.fn().mockResolvedValue({ items: [] }),
    } as unknown as CatalogApi,
    auth: createAuthService(),
  };
}
