import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { DatabaseRiScIndexSnapshotStore } from './service/riscIndexSnapshotStore';
import { RiScIndexScheduledRefresh } from './service/riscIndexScheduledRefresh';
import { createInMemoryRiScIndexStore } from './service/riscIndexStore';
import { createRouter } from './service/router';

export const riskScorecardBackendPlugin = createBackendPlugin({
  pluginId: 'risk-scorecard',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        database: coreServices.database,
        rootLifecycle: coreServices.rootLifecycle,
      },
      async init({
        logger,
        httpRouter,
        discovery,
        auth,
        config,
        scheduler,
        database,
        rootLifecycle,
      }) {
        const catalogClient = new CatalogClient({
          discoveryApi: discovery,
        });
        const riScIndexStore = createInMemoryRiScIndexStore();
        const refresher = new RiScIndexScheduledRefresh({
          logger,
          discovery,
          auth,
          config,
          scheduler,
          riScIndexStore,
          snapshotStore: new DatabaseRiScIndexSnapshotStore(database),
        });

        httpRouter.use(
          (await createRouter({ catalogClient, auth, riScIndexStore })) as any,
        );
        rootLifecycle.addStartupHook(() => refresher.start(), { logger });
      },
    });
  },
});
