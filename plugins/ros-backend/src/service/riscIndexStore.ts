export type RiScIndexEntry = {
  sourceUrl: string;
  coversComponentRefs: string[];
};

export type RiScIndexStore = {
  replaceSnapshot(analyses: RiScIndexEntry[]): void;
  getAnalysesUrlsForComponentRef(componentRef: string): readonly string[];
};

export const riScIndexStore = createInMemoryRiScIndexStore();

export function createInMemoryRiScIndexStore(): RiScIndexStore {
  let analysesByComponentRef = new Map<string, readonly RiScIndexEntry[]>();

  return {
    replaceSnapshot(analyses) {
      analysesByComponentRef = buildAnalysesByComponentRef(analyses);
    },
    getAnalysesUrlsForComponentRef(componentRef) {
      const matchingAnalyses =
        analysesByComponentRef
          .get(componentRef)
          ?.map(analysis => analysis.sourceUrl) ?? [];
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
