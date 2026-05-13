import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef, riScRouteRef, scenarioRouteRef } from './routes';
import { systemRiScsFeatureFlag } from './utils/featureFlags';

export const riScPlugin = createPlugin({
  id: 'riSc',
  featureFlags: [
    {
      name: systemRiScsFeatureFlag,
      description: 'Testing av system-RoS for Team SKVIS. Bruk på eget ansvar.',
    },
  ],
  routes: {
    root: rootRouteRef,
    scenario: scenarioRouteRef,
    riSc: riScRouteRef,
  },
});

export const RiScPage = riScPlugin.provide(
  createRoutableExtension({
    name: 'RiScPage',
    component: () => import('./PluginRoot').then(m => m.PluginRoot),
    mountPoint: rootRouteRef,
  }),
);
