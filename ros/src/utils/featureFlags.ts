import {
  featureFlagsApiRef,
  type PluginFeatureFlagConfig,
  useApi,
} from '@backstage/core-plugin-api';

export const systemRiScsFeatureFlag = 'system-riscs';

export const riScFeatureFlags: PluginFeatureFlagConfig[] = [
  // {
  //   name: systemRiScsFeatureFlag,
  //   description:
  //     'Testing av system-RoS for Team SKVIS. Bruk på eget ansvar. UNNGÅ lagring av System-RoSer i åpne repoer.',
  // },
];

export function useSystemRiScsFeatureFlag(): boolean {
  const featureFlagsApi = useApi(featureFlagsApiRef);
  return featureFlagsApi.isActive(systemRiScsFeatureFlag);
}
