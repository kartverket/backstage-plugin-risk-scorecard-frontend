import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

export const riskScorecardBackendPlugin = createBackendPlugin({
  pluginId: 'risk-scorecard',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
      },
      async init({ httpRouter }) {
        httpRouter.use((await createRouter()) as any);
      },
    });
  },
});
