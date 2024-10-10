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

import packageJson from '../package.json';

const pluginVersionToMetaTag = document.createElement('meta');
pluginVersionToMetaTag.setAttribute('name', 'plugin-version');
pluginVersionToMetaTag.setAttribute('version', `${packageJson.version}`);
document.querySelector('head')?.appendChild(pluginVersionToMetaTag);
