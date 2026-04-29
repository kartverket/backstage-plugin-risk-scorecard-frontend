export type RiScIndexEntry = {
  riScId: string;
  sourceComponentRef: string;
  coversComponentRefs: string[];
};

export type RiScIndexReference = {
  id: string;
  componentRef: string;
};

export type RiScIndexStore = {
  replaceSnapshot(analyses: RiScIndexEntry[]): void;
  getAnalysesForComponentRef(
    componentRef: string,
  ): readonly RiScIndexReference[];
};

export const riScIndexStore = createInMemoryRiScIndexStore();

export function createInMemoryRiScIndexStore(): RiScIndexStore {
  let analysesByComponentRef = new Map<string, readonly RiScIndexEntry[]>();
  const mockAnalysesByComponentRef = buildAnalysesByComponentRef([
    {
      riScId: 'risc-7ssVK',
      sourceComponentRef: 'component:default/kv-ros-test-2',
      coversComponentRefs: [
        'component:default/kv-ros-test-1',
        'component:default/kv-ros-test-2',
        'component:default/kv-ros-test-3',
        'component:default/kv-ros-test-4',
        'component:default/kv-ros-test-5',
        'component:default/kv-ros-test-6',
      ],
    },
  ]);

  return {
    replaceSnapshot(analyses) {
      analysesByComponentRef = buildAnalysesByComponentRef(analyses);
    },
    getAnalysesForComponentRef(componentRef) {
      const matchingAnalyses = (analysesByComponentRef.get(componentRef) ?? [])
        .concat(mockAnalysesByComponentRef.get(componentRef) ?? [])
        .map(analysis => ({
          id: analysis.riScId,
          componentRef: analysis.sourceComponentRef,
        }));
      return Object.freeze(matchingAnalyses);
    },
  };
}

function buildAnalysesByComponentRef(
  analyses: RiScIndexEntry[],
): Map<string, readonly RiScIndexEntry[]> {
  const groupedAnalyses = new Map<string, RiScIndexEntry[]>();

  for (const analysis of analyses) {
    for (const componentRef of new Set(analysis.coversComponentRefs)) {
      const existingEntries = groupedAnalyses.get(componentRef);

      if (existingEntries) {
        existingEntries.push(analysis);
      } else {
        groupedAnalyses.set(componentRef, [analysis]);
      }
    }
  }

  return groupedAnalyses;
}
