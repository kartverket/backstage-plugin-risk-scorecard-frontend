import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef, rosRouteRef, scenarioRouteRef } from './routes';

export const rosPlugin = createPlugin({
  id: 'ros',
  routes: {
    root: rootRouteRef,
    ros: rosRouteRef,
    scenario: scenarioRouteRef,
  },
});

export const RosPage = rosPlugin.provide(
  createRoutableExtension({
    name: 'RosPage',
    component: () => import('./components/ROSPlugin').then(m => m.ROSPlugin),
    mountPoint: rootRouteRef,
  }),
);
