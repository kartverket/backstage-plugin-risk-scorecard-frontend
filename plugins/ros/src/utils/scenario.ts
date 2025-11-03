import { RiScWithMetadata, Scenario } from './types.ts';

export function getScenarioOfIdFromRiSc(
  id: string,
  riSc: RiScWithMetadata | null,
): Scenario | null {
  const oldScenario = riSc?.content.scenarios.find(s => s.ID === id);
  return oldScenario ?? null;
}
