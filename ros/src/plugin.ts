import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef, riScRouteRef, scenarioRouteRef } from './routes';

export const riScPlugin = createPlugin({
  id: 'riSc',
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
