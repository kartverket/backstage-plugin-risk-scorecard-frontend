import { useQuery } from '@tanstack/react-query';
import { githubAuthApiRef, useApi } from '@backstage/core-plugin-api';
import { ScenarioDTO } from '../utils/DTOs.ts';

const PREDEFINED_SCENARIOS_SOURCE_OWNER = 'kartverket';
const PREDEFINED_SCENARIOS_SOURCE_REPO = 'initial-riscs-collection';
const PREDEFINED_SCENARIOS_SOURCE_PATH = 'initial-riscs/web-app-api.json'; // Må endres til aktuell fil når vi vet det
const PREDEFINED_SCENARIOS_SOURCE_REF = 'main'; // Må endres til aktuell ref når vi vet det
const PREDEFINED_SCENARIOS_SOURCE_TEST_REF = 'add-scenarios'; // Må endres til branchen når den kommer

const GITHUB_API_VERSION = '2022-11-28';

const PREDEFINED_SCENARIO_IDS = ['xK9mP', 'mF6xQ', 'PDEF1']; // Må endres til ekte id'er.

const PREDEFINED_SCENARIOS_QUERY_KEY = ['predefined-scenarios'] as const;

function buildPredefinedScenariosUrl(ref: string): string {
  return `https://api.github.com/repos/${PREDEFINED_SCENARIOS_SOURCE_OWNER}/${PREDEFINED_SCENARIOS_SOURCE_REPO}/contents/${PREDEFINED_SCENARIOS_SOURCE_PATH}?ref=${ref}`;
}

async function fetchPredefinedScenarios(
  isTestPredefinedScenariosEnabled: boolean,
  githubToken: string,
  signal: AbortSignal,
): Promise<ScenarioDTO[]> {
  const response = await fetch(
    buildPredefinedScenariosUrl(
      isTestPredefinedScenariosEnabled
        ? PREDEFINED_SCENARIOS_SOURCE_TEST_REF
        : PREDEFINED_SCENARIOS_SOURCE_REF,
    ),
    {
      signal,
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.raw+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      },
    },
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
  const githubApi = useApi(githubAuthApiRef);

  return useQuery({
    queryKey: [
      PREDEFINED_SCENARIOS_QUERY_KEY,
      isTestPredefinedScenariosEnabled ? 'test' : 'main',
    ],
    staleTime: 1000,
    retry: (count, error) => {
      if (
        error.name === 'Unexpected status 401' ||
        error.name === 'Unexpected status 403' ||
        error.name === 'Unexpected status 404' ||
        error.name === 'Unexpected status 429'
      ) {
        return false;
      }
      return count < 2;
    },
    queryFn: async ({ signal }) => {
      const githubToken = await githubApi.getAccessToken(['repo']);
      return fetchPredefinedScenarios(
        isTestPredefinedScenariosEnabled,
        githubToken,
        signal,
      );
    },
  });
}
