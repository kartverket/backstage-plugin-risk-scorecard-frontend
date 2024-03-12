import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef, rosRouteRef } from './routes';

export const rosPlugin = createPlugin({
  id: 'ros',
  routes: {
    root: rootRouteRef,
    ros: rosRouteRef,
  },
});

export const RosPage = rosPlugin.provide(
  createRoutableExtension({
    name: 'RosPlugin',
    component: () => import('./components/ROSPlugin').then(m => m.ROSPlugin),
    mountPoint: rootRouteRef,
  }),
);
