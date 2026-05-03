/**
 * @jest-environment node
 */

import { createInMemoryRiScIndexStore } from './riscIndexStore';

describe('createInMemoryRiScIndexStore', () => {
  it('returns system RiScs for analyses that cover an entity ref', () => {
    const store = createInMemoryRiScIndexStore();

    store.replaceSnapshot([
      {
        riScId: 'risc-1',
        sourceEntityRef: 'component:default/source-1',
        appliesToBackstageEntityRefs: [
          'component:default/kv-ros-test-1',
          'component:default/kv-ros-test-2',
        ],
        lastSavedAt: '2026-05-01T08:30:00Z',
      },
      {
        riScId: 'risc-2',
        sourceEntityRef: 'component:default/source-2',
        appliesToBackstageEntityRefs: ['component:default/kv-ros-test-2'],
        lastSavedAt: '2026-05-02T08:30:00Z',
      },
    ]);

    expect(
      store.getSystemRiScsForEntityRef('component:default/kv-ros-test-1'),
    ).toEqual([
      {
        id: 'risc-1',
        entityRef: 'component:default/source-1',
        lastSavedAt: '2026-05-01T08:30:00Z',
      },
    ]);
    expect(
      store.getSystemRiScsForEntityRef('component:default/kv-ros-test-2'),
    ).toEqual([
      {
        id: 'risc-1',
        entityRef: 'component:default/source-1',
        lastSavedAt: '2026-05-01T08:30:00Z',
      },
    ]);
    expect(
      store.getSystemRiScsForEntityRef('component:default/does-not-exist'),
    ).toEqual([]);
  });

  it('replaces previous results when a new snapshot is stored', () => {
    const store = createInMemoryRiScIndexStore();

    store.replaceSnapshot([
      {
        riScId: 'risc-1',
        sourceEntityRef: 'component:default/source-1',
        appliesToBackstageEntityRefs: [
          'component:default/kv-ros-test-1',
          'component:default/kv-ros-test-3',
        ],
        lastSavedAt: '2026-05-01T08:30:00Z',
      },
    ]);

    store.replaceSnapshot([
      {
        riScId: 'risc-2',
        sourceEntityRef: 'component:default/source-2',
        appliesToBackstageEntityRefs: [
          'component:default/kv-ros-test-2',
          'component:default/kv-ros-test-4',
        ],
        lastSavedAt: '2026-05-02T08:30:00Z',
      },
    ]);

    expect(
      store.getSystemRiScsForEntityRef('component:default/kv-ros-test-1'),
    ).toEqual([]);
    expect(
      store.getSystemRiScsForEntityRef('component:default/kv-ros-test-2'),
    ).toEqual([
      {
        id: 'risc-2',
        entityRef: 'component:default/source-2',
        lastSavedAt: '2026-05-02T08:30:00Z',
      },
    ]);
  });
});
