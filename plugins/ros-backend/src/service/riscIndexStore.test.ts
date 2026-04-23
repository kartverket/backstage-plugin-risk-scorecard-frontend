/**
 * @jest-environment node
 */

import { createInMemoryRiScIndexStore } from './riscIndexStore';

describe('createInMemoryRiScIndexStore', () => {
  it('returns source urls for analyses that cover a component ref', () => {
    const store = createInMemoryRiScIndexStore();

    store.replaceSnapshot([
      {
        sourceUrl: 'https://example.org/risc-1.risc.yaml',
        coversComponentRefs: [
          'component:default/kv-ros-test-1',
          'component:default/kv-ros-test-2',
        ],
      },
      {
        sourceUrl: 'https://example.org/risc-2.risc.yaml',
        coversComponentRefs: ['component:default/kv-ros-test-2'],
      },
    ]);

    expect(
      store.getAnalysesUrlsForComponentRef('component:default/kv-ros-test-1'),
    ).toEqual([
      'https://example.org/risc-1.risc.yaml',
    ]);
    expect(
      store.getAnalysesUrlsForComponentRef('component:default/kv-ros-test-2'),
    ).toEqual([
      'https://example.org/risc-1.risc.yaml',
      'https://example.org/risc-2.risc.yaml',
    ]);
    expect(
      store.getAnalysesUrlsForComponentRef('component:default/does-not-exist'),
    ).toEqual([]);
  });

  it('replaces previous results when a new snapshot is stored', () => {
    const store = createInMemoryRiScIndexStore();

    store.replaceSnapshot([
      {
        sourceUrl: 'https://example.org/risc-1.risc.yaml',
        coversComponentRefs: ['component:default/kv-ros-test-1'],
      },
    ]);

    store.replaceSnapshot([
      {
        sourceUrl: 'https://example.org/risc-2.risc.yaml',
        coversComponentRefs: ['component:default/kv-ros-test-2'],
      },
    ]);

    expect(
      store.getAnalysesUrlsForComponentRef('component:default/kv-ros-test-1'),
    ).toEqual([]);
    expect(
      store.getAnalysesUrlsForComponentRef('component:default/kv-ros-test-2'),
    ).toEqual(['https://example.org/risc-2.risc.yaml']);
  });
});
