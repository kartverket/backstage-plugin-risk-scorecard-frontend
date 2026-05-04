import { featureFlagsApiRef, useApi } from '@backstage/core-plugin-api';

export const systemRiScsFeatureFlag = 'system-riscs';

export function useSystemRiScsFeatureFlag(): boolean {
  const featureFlagsApi = useApi(featureFlagsApiRef);
  return featureFlagsApi.isActive(systemRiScsFeatureFlag);
}
