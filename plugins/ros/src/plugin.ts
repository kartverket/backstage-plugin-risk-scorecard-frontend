import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef, rosRouteRef, scenarioRouteRef } from './routes';

export const rosPlugin = createPlugin({
  id: 'ros',
  routes: {
    root: rootRouteRef,
    scenario: scenarioRouteRef,
    ros: rosRouteRef,
  },
});

export const RosPage = rosPlugin.provide(
  createRoutableExtension({
    name: 'RosPage',
    component: () => import('./components/rosPlugin').then(m => m.ROSPlugin),
    mountPoint: rootRouteRef,
  }),
);
