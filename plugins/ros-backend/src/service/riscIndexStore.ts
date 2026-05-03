export type RiScIndexEntry = {
  riScId: string;
  sourceEntityRef: string;
  appliesToBackstageEntityRefs: string[];
  lastSavedAt: string;
};

export type RiScIndexReference = {
  id: string;
  entityRef: string;
  lastSavedAt: string;
};

export type RiScIndexStore = {
  replaceSnapshot(analyses: RiScIndexEntry[]): void;
  getSystemRiScsForEntityRef(entityRef: string): readonly RiScIndexReference[];
};

export const riScIndexStore = createInMemoryRiScIndexStore();

export function createInMemoryRiScIndexStore(): RiScIndexStore {
  let analysesByEntityRef = new Map<string, readonly RiScIndexEntry[]>();

  return {
    replaceSnapshot(analyses) {
      analysesByEntityRef = buildAnalysesByEntityRef(analyses);
    },
    getSystemRiScsForEntityRef(entityRef) {
      const matchingAnalyses = (analysesByEntityRef.get(entityRef) ?? [])
        .filter(x => x.appliesToBackstageEntityRefs.length > 1)
        .map(analysis => ({
          id: analysis.riScId,
          entityRef: analysis.sourceEntityRef,
          lastSavedAt: analysis.lastSavedAt,
        }));
      return Object.freeze(matchingAnalyses);
    },
  };
}

function buildAnalysesByEntityRef(
  analyses: RiScIndexEntry[],
): Map<string, readonly RiScIndexEntry[]> {
  const groupedAnalyses = new Map<string, RiScIndexEntry[]>();

  for (const analysis of analyses) {
    for (const entityRef of new Set(analysis.appliesToBackstageEntityRefs)) {
      const existingEntries = groupedAnalyses.get(entityRef);

      if (existingEntries) {
        existingEntries.push(analysis);
      } else {
        groupedAnalyses.set(entityRef, [analysis]);
      }
    }
  }

  return groupedAnalyses;
}
