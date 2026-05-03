/**
 * @jest-environment node
 */

import express from 'express';
import { AddressInfo } from 'net';
import { riScIndexStore } from './riscIndexStore';
import { createRouter } from './router';

describe('createRouter', () => {
  it('returns system RiScs for an entity ref', async () => {
    riScIndexStore.replaceSnapshot([
      {
        riScId: 'risc-1',
        sourceEntityRef: 'component:default/source-1',
        appliesToBackstageEntityRefs: ['component:default/kv-ros-test-6'],
        lastSavedAt: '2026-05-02T08:30:00Z',
      },
      {
        riScId: 'risc-7ssVK',
        sourceEntityRef: 'component:default/source-2',
        appliesToBackstageEntityRefs: [
          'component:default/kv-ros-test-1',
          'component:default/kv-ros-test-6',
        ],
        lastSavedAt: '2026-05-01T08:30:00Z',
      },
    ]);

    const response = await makeRequest(
      '/system-riscs?entityRef=component:default/kv-ros-test-6',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 'risc-7ssVK',
        entityRef: 'component:default/source-2',
        lastSavedAt: '2026-05-01T08:30:00Z',
      },
    ]);
  });

  it('returns 400 when entityRef is missing', async () => {
    riScIndexStore.replaceSnapshot([]);

    const response = await makeRequest('/system-riscs');

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
): Promise<{ status: number; body: unknown }> {
  const app = express();
  app.use(await createRouter());

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
