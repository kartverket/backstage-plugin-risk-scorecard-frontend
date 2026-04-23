/**
 * @jest-environment node
 */

import express from 'express';
import { AddressInfo } from 'net';
import { riScIndexStore } from './riscIndexStore';
import { createRouter } from './router';

describe('createRouter', () => {
  it('returns the analyses for a component ref', async () => {
    riScIndexStore.replaceSnapshot([
      {
        sourceUrl: 'https://example.org/risc-1.risc.yaml',
        coversComponentRefs: ['component:default/kv-ros-test-6'],
      },
      {
        sourceUrl: 'https://example.org/risc-7ssVK.risc.yaml',
        coversComponentRefs: [
          'component:default/kv-ros-test-1',
          'component:default/kv-ros-test-6',
        ],
      },
    ]);

    const response = await makeRequest(
      '/risc-index?componentRef=component:default/kv-ros-test-6',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      'https://example.org/risc-1.risc.yaml',
      'https://example.org/risc-7ssVK.risc.yaml',
    ]);
  });

  it('returns 400 when componentRef is missing', async () => {
    riScIndexStore.replaceSnapshot([]);

    const response = await makeRequest('/risc-index');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Query parameter "componentRef" is required',
    });
  });
});

afterEach(() => {
  riScIndexStore.replaceSnapshot([]);
});

async function makeRequest(path: string): Promise<{ status: number; body: unknown }> {
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
