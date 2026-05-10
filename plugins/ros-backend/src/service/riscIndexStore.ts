export type RiScIndexEntry = {
  riScId: string;
  sourceEntityRef: string;
  appliesTo: string[];
  lastSavedAt: string;
};

export type RiScIndexStore = {
  replaceSnapshot(analyses: RiScIndexEntry[]): void;
  getRiScsForEntityRef(entityRef: string): readonly RiScIndexEntry[];
};

export function createInMemoryRiScIndexStore(): RiScIndexStore {
  let analysesByEntityRef = new Map<string, readonly RiScIndexEntry[]>();

  return {
    replaceSnapshot(analyses) {
      analysesByEntityRef = buildAnalysesByEntityRef(analyses);
    },
    getRiScsForEntityRef(entityRef) {
      const matchingAnalyses = analysesByEntityRef.get(entityRef) ?? [];
      return Object.freeze(matchingAnalyses);
    },
  };
}

function buildAnalysesByEntityRef(
  analyses: RiScIndexEntry[],
): Map<string, readonly RiScIndexEntry[]> {
  const groupedAnalyses = new Map<string, RiScIndexEntry[]>();

  for (const analysis of analyses) {
    for (const entityRef of new Set(analysis.appliesTo)) {
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
