import { useQuery } from '@tanstack/react-query';
import {
  configApiRef,
  fetchApiRef,
  githubAuthApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { ScenarioDTO } from '../utils/DTOs.ts';
import { buildNativeBackendUrls } from '../urls/backend.ts';
import { URLS } from '../urls/index.ts';
import { useGithubRepositoryInformation } from '../utils/hooks.ts';
import { latestSupportedVersion } from '../utils/constants.ts';
import { useNativeRiScBackendFeatureFlag } from '../utils/featureFlags.ts';

const PREDEFINED_SCENARIOS_TEMPLATE_ID = 'web-app-api';
const PREDEFINED_SCENARIOS_SOURCE_TEST_REF = 'add-scenarios';

const PREDEFINED_SCENARIO_IDS = ['xK9mP', 'mF6xQ'];

const PREDEFINED_SCENARIOS_QUERY_KEY = ['predefined-scenarios'] as const;

export function usePredefinedScenarios(
  isTestPredefinedScenariosEnabled: boolean,
) {
  const configApi = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const githubApi = useApi(githubAuthApiRef);
  const { fetch } = useApi(fetchApiRef);
  const repoInformation = useGithubRepositoryInformation();
  const isNativeBackendEnabled = useNativeRiScBackendFeatureFlag();

  const backendUrl = configApi.getString('backend.baseUrl');

  const { uriToFetchInitRiScTemplate: uriToFetchInitRiScTemplateNative } =
    buildNativeBackendUrls({
      baseUrl: `${backendUrl}/api/risk-scorecard`,
      owner: repoInformation.owner,
      repo: repoInformation.name,
      version: latestSupportedVersion,
    });

  function uriToFetchInitRiScTemplateProxy(id: string, ref?: string) {
    const base = `${backendUrl}${URLS.backend.fetchInitRiScTemplate.replace(':id', id)}`;
    return ref ? `${base}?ref=${encodeURIComponent(ref)}` : base;
  }

  const uriToFetchInitRiScTemplate = isNativeBackendEnabled
    ? uriToFetchInitRiScTemplateNative
    : uriToFetchInitRiScTemplateProxy;

  return useQuery({
    queryKey: [
      PREDEFINED_SCENARIOS_QUERY_KEY,
      isNativeBackendEnabled ? 'native' : 'proxy',
      isTestPredefinedScenariosEnabled ? 'test' : 'main',
    ],
    retry: (count, error) => {
      if (
        error.message === 'Unexpected status 401' ||
        error.message === 'Unexpected status 403' ||
        error.message === 'Unexpected status 404' ||
        error.message === 'Unexpected status 429'
      ) {
        return false;
      }
      return count < 2;
    },
    queryFn: async ({ signal }): Promise<ScenarioDTO[]> => {
      const [identity, githubToken] = await Promise.all([
        identityApi.getCredentials(),
        githubApi.getAccessToken(['repo']),
      ]);

      const response = await fetch(
        uriToFetchInitRiScTemplate(
          PREDEFINED_SCENARIOS_TEMPLATE_ID,
          isTestPredefinedScenariosEnabled
            ? PREDEFINED_SCENARIOS_SOURCE_TEST_REF
            : undefined,
        ),
        {
          signal,
          headers: {
            Authorization: `Bearer ${identity.token}`,
            'GitHub-Access-Token': githubToken,
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
    },
  });
}
