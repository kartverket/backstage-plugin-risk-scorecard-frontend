/**
 * @jest-environment node
 */

import type { DatabaseService } from '@backstage/backend-plugin-api';
import knexFactory, { type Knex } from 'knex';
import { DatabaseRiScIndexStore, type RiScIndexEntry } from './riscIndexStore';

describe('DatabaseRiScIndexStore', () => {
  let client: Knex;
  let store: DatabaseRiScIndexStore;

  beforeEach(() => {
    client = knexFactory({
      client: 'better-sqlite3',
      connection: {
        filename: ':memory:',
      },
      useNullAsDefault: true,
    });
    store = new DatabaseRiScIndexStore(createDatabaseService(client));
  });

  afterEach(async () => {
    await client.destroy();
  });

  it('returns RiScs for analyses that cover an entity ref', async () => {
    const riSc1 = createRiScIndexEntry({
      riScId: 'risc-1',
      sourceEntityRef: 'component:default/source-1',
      appliesTo: [
        'component:default/kv-ros-test-1',
        'component:default/kv-ros-test-2',
      ],
      lastSavedAt: '2026-05-01T08:30:00Z',
    });
    const riSc2 = createRiScIndexEntry({
      riScId: 'risc-2',
      sourceEntityRef: 'component:default/source-2',
      appliesTo: ['component:default/kv-ros-test-2'],
      lastSavedAt: '2026-05-02T08:30:00Z',
    });

    await store.replaceIndex([riSc1, riSc2]);

    await expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-1'),
    ).resolves.toEqual([riSc1]);
    await expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-2'),
    ).resolves.toEqual([riSc1, riSc2]);
    await expect(
      store.getRiScsForEntityRef('component:default/does-not-exist'),
    ).resolves.toEqual([]);
  });

  it('returns the full persisted index', async () => {
    const riSc1 = createRiScIndexEntry({
      riScId: 'risc-1',
      sourceEntityRef: 'component:default/source-1',
      appliesTo: ['component:default/kv-ros-test-1'],
      lastSavedAt: '2026-05-01T08:30:00Z',
    });
    const riSc2 = createRiScIndexEntry({
      riScId: 'risc-2',
      sourceEntityRef: 'component:default/source-2',
      appliesTo: ['component:default/kv-ros-test-2'],
      lastSavedAt: '2026-05-02T08:30:00Z',
    });

    await store.replaceIndex([riSc2, riSc1]);

    await expect(store.getAllRiScs()).resolves.toEqual([riSc1, riSc2]);
  });

  it('replaces the full index in one database transaction', async () => {
    const oldRiSc = createRiScIndexEntry({
      riScId: 'risc-1',
      sourceEntityRef: 'component:default/source-1',
      appliesTo: ['component:default/kv-ros-test-1'],
      lastSavedAt: '2026-05-01T08:30:00Z',
    });
    const newRiSc = createRiScIndexEntry({
      riScId: 'risc-2',
      sourceEntityRef: 'component:default/source-2',
      appliesTo: ['component:default/kv-ros-test-2'],
      lastSavedAt: '2026-05-02T08:30:00Z',
    });

    await store.replaceIndex([oldRiSc]);
    await store.replaceIndex([newRiSc]);

    await expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-1'),
    ).resolves.toEqual([]);
    await expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-2'),
    ).resolves.toEqual([newRiSc]);
  });

  it('rolls back the previous index when a full replacement fails', async () => {
    const oldRiSc = createRiScIndexEntry({
      riScId: 'risc-1',
      sourceEntityRef: 'component:default/source-1',
      appliesTo: ['component:default/kv-ros-test-1'],
      lastSavedAt: '2026-05-01T08:30:00Z',
    });
    const invalidRiSc = createRiScIndexEntry({
      riScId: 'risc-2',
      sourceEntityRef: 'component:default/source-2',
      appliesTo: [null as unknown as string],
      lastSavedAt: '2026-05-02T08:30:00Z',
    });

    await store.replaceIndex([oldRiSc]);
    await expect(store.replaceIndex([invalidRiSc])).rejects.toThrow();

    await expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-1'),
    ).resolves.toEqual([oldRiSc]);
  });

  it('can update one RiSc entry without rebuilding the full index', async () => {
    const firstVersion = createRiScIndexEntry({
      riScId: 'risc-1',
      sourceEntityRef: 'component:default/source-1',
      appliesTo: ['component:default/kv-ros-test-1'],
      lastSavedAt: '2026-05-01T08:30:00Z',
    });
    const secondVersion = createRiScIndexEntry({
      riScId: 'risc-1',
      sourceEntityRef: 'component:default/source-1',
      appliesTo: ['component:default/kv-ros-test-2'],
      lastSavedAt: '2026-05-02T08:30:00Z',
    });

    await store.upsertEntry(firstVersion);
    await store.upsertEntry(secondVersion);

    await expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-1'),
    ).resolves.toEqual([]);
    await expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-2'),
    ).resolves.toEqual([secondVersion]);
  });

  it('can delete one RiSc entry without rebuilding the full index', async () => {
    const riSc = createRiScIndexEntry({
      riScId: 'risc-1',
      sourceEntityRef: 'component:default/source-1',
      appliesTo: ['component:default/kv-ros-test-1'],
      lastSavedAt: '2026-05-01T08:30:00Z',
    });

    await store.replaceIndex([riSc]);
    await store.deleteEntry(riSc.sourceFilePath);

    await expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-1'),
    ).resolves.toEqual([]);
    await expect(store.hasEntries()).resolves.toBe(false);
  });

  it('reports whether the persisted index contains entries', async () => {
    await expect(store.hasEntries()).resolves.toBe(false);

    await store.replaceIndex([
      createRiScIndexEntry({
        riScId: 'risc-1',
        sourceEntityRef: 'component:default/source-1',
        appliesTo: ['component:default/kv-ros-test-1'],
        lastSavedAt: '2026-05-01T08:30:00Z',
      }),
    ]);

    await expect(store.hasEntries()).resolves.toBe(true);

    await store.replaceIndex([]);

    await expect(store.hasEntries()).resolves.toBe(false);
  });
});

function createRiScIndexEntry(
  entry: Omit<RiScIndexEntry, 'sourceFilePath'> & {
    sourceFilePath?: string;
  },
): RiScIndexEntry {
  return {
    sourceFilePath:
      entry.sourceFilePath ??
      `https://github.com/org/repo/.security/risc/${entry.riScId}.risc.yaml`,
    ...entry,
  };
}

function createDatabaseService(client: Knex): DatabaseService {
  return {
    getClient: jest.fn().mockResolvedValue(client),
  } as unknown as DatabaseService;
}
