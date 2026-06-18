import {
  featureFlagsApiRef,
  type PluginFeatureFlagConfig,
  useApi,
} from '@backstage/core-plugin-api';

export const systemRiScsFeatureFlag = 'system-riscs';
export const nativeRiScBackendFeatureFlag = 'native-risc-backend';
export const predefinedScenariosFeatureFlag = 'test-predefined-scenarios';

export const riScFeatureFlags: PluginFeatureFlagConfig[] = [
  // {
  //   name: systemRiScsFeatureFlag,
  //   description:
  //     'Testing av system-RoS for Team SKVIS. Bruk på eget ansvar. UNNGÅ lagring av System-RoSer i åpne repoer.',
  // },
  // {
  //   name: nativeRiScBackendFeatureFlag,
  //   description: 'Testing av ny backend for RoS skrevet i typescript.',
  // },
  {
    name: predefinedScenariosFeatureFlag,
    description:
      'Testing av forhåndsdefinerte scenarioer fra initial-riscs-collection repoet. Skru på for å hente fra PR-branch, skru av for å hente fra main.',
  },
];

export function useSystemRiScsFeatureFlag(): boolean {
  const featureFlagsApi = useApi(featureFlagsApiRef);
  return featureFlagsApi.isActive(systemRiScsFeatureFlag);
}

export function useNativeRiScBackendFeatureFlag(): boolean {
  const featureFlagsApi = useApi(featureFlagsApiRef);
  return featureFlagsApi.isActive(nativeRiScBackendFeatureFlag);
}

export function usePredefinedScenariosFeatureFlag(): boolean {
  const featureFlagsApi = useApi(featureFlagsApiRef);
  return featureFlagsApi.isActive(predefinedScenariosFeatureFlag);
}
