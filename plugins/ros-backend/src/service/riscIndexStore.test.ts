/**
 * @jest-environment node
 */

import { createInMemoryRiScIndexStore } from './riscIndexStore';

describe('createInMemoryRiScIndexStore', () => {
  it('returns source urls for analyses that cover a component ref', () => {
    const store = createInMemoryRiScIndexStore();

    store.replaceSnapshot([
      {
        riScId: 'risc-1',
        sourceUrl: 'https://example.org/risc-1.risc.yaml',
        sourceComponentRef: 'component:default/source-1',
        coversComponentRefs: [
          'component:default/kv-ros-test-1',
          'component:default/kv-ros-test-2',
        ],
      },
      {
        riScId: 'risc-2',
        sourceUrl: 'https://example.org/risc-2.risc.yaml',
        sourceComponentRef: 'component:default/source-2',
        coversComponentRefs: ['component:default/kv-ros-test-2'],
      },
    ]);

    expect(
      store.getAnalysesForComponentRef('component:default/kv-ros-test-1'),
    ).toEqual([
      {
        id: 'risc-1',
        componentRef: 'component:default/source-1',
        sourceUrl: 'https://example.org/risc-1.risc.yaml',
      },
    ]);
    expect(
      store.getAnalysesForComponentRef('component:default/kv-ros-test-2'),
    ).toEqual([
      {
        id: 'risc-1',
        componentRef: 'component:default/source-1',
        sourceUrl: 'https://example.org/risc-1.risc.yaml',
      },
      {
        id: 'risc-2',
        componentRef: 'component:default/source-2',
        sourceUrl: 'https://example.org/risc-2.risc.yaml',
      },
    ]);
    expect(
      store.getAnalysesForComponentRef('component:default/does-not-exist'),
    ).toEqual([]);
  });

  it('replaces previous results when a new snapshot is stored', () => {
    const store = createInMemoryRiScIndexStore();

    store.replaceSnapshot([
      {
        riScId: 'risc-1',
        sourceUrl: 'https://example.org/risc-1.risc.yaml',
        sourceComponentRef: 'component:default/source-1',
        coversComponentRefs: ['component:default/kv-ros-test-1'],
      },
    ]);

    store.replaceSnapshot([
      {
        riScId: 'risc-2',
        sourceUrl: 'https://example.org/risc-2.risc.yaml',
        sourceComponentRef: 'component:default/source-2',
        coversComponentRefs: ['component:default/kv-ros-test-2'],
      },
    ]);

    expect(
      store.getAnalysesForComponentRef('component:default/kv-ros-test-1'),
    ).toEqual([]);
    expect(
      store.getAnalysesForComponentRef('component:default/kv-ros-test-2'),
    ).toEqual([
      {
        id: 'risc-2',
        componentRef: 'component:default/source-2',
        sourceUrl: 'https://example.org/risc-2.risc.yaml',
      },
    ]);
  });
});
