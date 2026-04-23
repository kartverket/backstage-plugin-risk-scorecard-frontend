import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { buildRiskScorecardRiScIndex } from './service/riscIndex';

export const riskScorecardBackendPlugin = createBackendPlugin({
  pluginId: 'risk-scorecard',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        lifecycle: coreServices.lifecycle,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, logger, lifecycle, discovery, auth, config }) {
        httpRouter.use((await createRouter({ logger })) as any);
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });

        lifecycle.addStartupHook(
          async () => {
            const scopedLogger = logger.child({
              module: 'risk-scorecard-risc-index',
            });

            try {
              await buildRiskScorecardRiScIndex({
                logger: scopedLogger,
                discovery,
                auth,
                config,
              });
            } catch (error) {
              if (error instanceof Error) {
                scopedLogger.error('Failed to build RiSc index', error);
              } else {
                scopedLogger.error(
                  `Failed to build RiSc index: ${String(error)}`,
                );
              }
            }
          },
          { logger },
        );
      },
    });
  },
});
