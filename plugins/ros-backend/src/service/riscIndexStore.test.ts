/**
 * @jest-environment node
 */

import { createInMemoryRiScIndexStore } from './riscIndexStore';

describe('createInMemoryRiScIndexStore', () => {
  it('returns RiScs for analyses that cover an entity ref', () => {
    const store = createInMemoryRiScIndexStore();
    const riSc1 = {
      riScId: 'risc-1',
      sourceEntityRef: 'component:default/source-1',
      appliesToBackstageEntityRefs: [
        'component:default/kv-ros-test-1',
        'component:default/kv-ros-test-2',
      ],
      lastSavedAt: '2026-05-01T08:30:00Z',
    };
    const riSc2 = {
      riScId: 'risc-2',
      sourceEntityRef: 'component:default/source-2',
      appliesToBackstageEntityRefs: ['component:default/kv-ros-test-2'],
      lastSavedAt: '2026-05-02T08:30:00Z',
    };

    store.replaceSnapshot([riSc1, riSc2]);

    expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-1'),
    ).toEqual([riSc1]);
    expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-2'),
    ).toEqual([riSc1, riSc2]);
    expect(
      store.getRiScsForEntityRef('component:default/does-not-exist'),
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
      store.getRiScsForEntityRef('component:default/kv-ros-test-1'),
    ).toEqual([]);
    expect(
      store.getRiScsForEntityRef('component:default/kv-ros-test-2'),
    ).toEqual([
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
  });
});
