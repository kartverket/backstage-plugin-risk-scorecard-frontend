import { useQuery } from '@tanstack/react-query';
import { ScenarioDTO } from '../utils/DTOs.ts';

const PREDEFINED_SCENARIOS_SOURCE_URL =
  'https://raw.githubusercontent.com/kartverket/initial-riscs-collection/refs/heads/main/initial-riscs/ops.json'; // Må endres til aktuell fil når vi vet det
const PREDEFINED_SCENARIOS_SOURCE_BRANCH_URL =
  'https://raw.githubusercontent.com/aleksanderobrestad/testaleksander/refs/heads/main/testinitros.json'; // Må endres til branchen når den kommer

const PREDEFINED_SCENARIO_IDS = ['PDEF1']; // Må endres til ekte id'er.

const PREDEFINED_SCENARIOS_QUERY_KEY = ['predefined-scenarios'] as const;

async function fetchPredefinedScenarioTemplates(
  isTestPredefinedScenariosEnabled: boolean,
  signal: AbortSignal,
): Promise<ScenarioDTO[]> {
  const response = await fetch(
    isTestPredefinedScenariosEnabled
      ? PREDEFINED_SCENARIOS_SOURCE_BRANCH_URL
      : PREDEFINED_SCENARIOS_SOURCE_URL,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Unexpected status ${response.status}`);
  }
  const data: unknown = await response.json();
  const scenarios = (data as { scenarios?: ScenarioDTO[] })?.scenarios;
  if (!Array.isArray(scenarios)) {
    throw new Error('Source file has no scenarios array');
  }

  return scenarios.filter(dto =>
    PREDEFINED_SCENARIO_IDS.includes(dto.scenario.ID),
  );
}

export function usePredefinedScenarios(
  isTestPredefinedScenariosEnabled: boolean,
) {
  return useQuery({
    queryKey: PREDEFINED_SCENARIOS_QUERY_KEY,
    queryFn: ({ signal }) =>
      fetchPredefinedScenarioTemplates(
        isTestPredefinedScenariosEnabled,
        signal,
      ),
  });
}
