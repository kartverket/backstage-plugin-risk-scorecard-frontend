import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const rosPlugin = createPlugin({
  id: 'ros',
  routes: {
    root: rootRouteRef,
  },
});

export const RosPage = rosPlugin.provide(
  createRoutableExtension({
    name: 'RosPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
