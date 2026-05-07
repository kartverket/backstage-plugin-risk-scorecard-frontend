import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';

/**
 * The RiSc backend plugin.
 *
 * Provides the API surface for RiSc CRUD operations, SOPS encryption/decryption,
 * GitHub PR lifecycle, schema validation/migration, and supporting integrations
 * (GCP KMS, Init RiSc templates, Slack feedback).
 */
export const rosPlugin = createBackendPlugin({
  pluginId: 'ros',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
      },
      async init({ logger, config, httpRouter, httpAuth }) {
        const router = await createRouter({ logger, config, httpAuth });
        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/',
          allow: 'user-cookie',
        });
      },
    });
  },
});
