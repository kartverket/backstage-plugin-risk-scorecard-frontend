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
      description: 'Show system RiScs and entity scope controls',
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
