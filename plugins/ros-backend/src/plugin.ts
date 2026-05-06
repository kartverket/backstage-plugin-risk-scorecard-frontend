import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { createRouter } from './service/router';

export const riskScorecardBackendPlugin = createBackendPlugin({
  pluginId: 'risk-scorecard',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
      },
      async init({ httpRouter, discovery, auth }) {
        const catalogClient = new CatalogClient({
          discoveryApi: discovery,
        });

        httpRouter.use((await createRouter({ catalogClient, auth })) as any);
      },
    });
  },
});
