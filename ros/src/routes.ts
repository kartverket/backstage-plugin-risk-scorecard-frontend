import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'riSc',
});

export const scenarioRouteRef = createSubRouteRef({
  id: 'scenarioId',
  parent: rootRouteRef,
  path: '/:riScId/:scenarioId',
});

export const riScRouteRef = createSubRouteRef({
  id: 'riScId',
  parent: rootRouteRef,
  path: '/:riScId',
});
