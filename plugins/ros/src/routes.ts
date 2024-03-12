import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'ros',
});

export const scenarioRouteRef = createSubRouteRef({
  id: 'scenarioId',
  parent: rootRouteRef,
  path: '/:rosId/:scenarioId',
});

export const rosRouteRef = createSubRouteRef({
  id: 'rosId',
  parent: rootRouteRef,
  path: '/:rosId',
});
