import { CatalogClient } from '@backstage/catalog-client';
import { RiScIndexScheduledRefresh } from './service/riscIndexScheduledRefresh';
import { DatabaseRiScIndexStore } from './service/riscIndexStore';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter as createBackendRouter } from './router';
import { RiScService } from './services/RiScService';
import { GitHubService } from './services/GitHubService';
import { SopsCryptoService } from './services/SopsCryptoService';
import { GcpKmsService } from './services/GcpKmsService';
import { InitRiScService } from './services/InitRiScService';
import { SlackService } from './services/SlackService';
import * as SchemaService from './services/SchemaService';
import * as ComparisonService from './services/ComparisonService';
import { createRouter } from './service/router.ts';

export const riskScorecardBackendPlugin = createBackendPlugin({
  pluginId: 'risk-scorecard',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        scheduler: coreServices.scheduler,
        database: coreServices.database,
        rootLifecycle: coreServices.rootLifecycle,
      },
      async init({
        logger,
        httpRouter,
        discovery,
        auth,
        httpAuth,
        config,
        scheduler,
        database,
        rootLifecycle,
      }) {
        const catalogClient = new CatalogClient({
          discoveryApi: discovery,
        });
        const riScIndexStore = new DatabaseRiScIndexStore(database);
        const refresher = new RiScIndexScheduledRefresh({
          logger,
          discovery,
          auth,
          config,
          scheduler,
          riScIndexStore,
        });

        httpRouter.use(
          await createRouter({ catalogClient, auth, httpAuth, riScIndexStore }),
        );
        rootLifecycle.addStartupHook(() => refresher.start(), { logger });

        // TODO: From migrated plugin. Fix a setup that is more cohesive
        // Read config
        const sopsAgeKey = config.getString('ros.sops.ageKey');
        const sopsBackendPublicKey = config.getString(
          'ros.sops.backendPublicKey',
        );
        const sopsSecurityTeamPublicKey = config.getString(
          'ros.sops.securityTeamPublicKey',
        );
        const sopsSecurityPlatformPublicKey = config.getString(
          'ros.sops.securityPlatformPublicKey',
        );
        const slackWebhookUrl =
          config.getOptionalString('ros.slack.webhookUrl') ?? undefined;
        const initRiScRepoOwner =
          config.getOptionalString('ros.initRiSc.repoOwner') ?? 'kartverket';
        const initRiScRepoName =
          config.getOptionalString('ros.initRiSc.repoName') ??
          'risk-scorecards-init';
        const additionalAllowedProjectIds =
          config.getOptionalStringArray(
            'ros.gcp.additionalAllowedProjectIds',
          ) ?? [];

        // Instantiate services
        const gitHubService = new GitHubService();
        const cryptoService = new SopsCryptoService({
          agePrivateKey: sopsAgeKey,
          backendPublicKey: sopsBackendPublicKey,
          securityTeamPublicKey: sopsSecurityTeamPublicKey,
          securityPlatformPublicKey: sopsSecurityPlatformPublicKey,
        });

        const riScService = new RiScService(
          gitHubService,
          cryptoService,
          SchemaService,
          ComparisonService,
          logger,
        );

        const gcpKmsService = new GcpKmsService({
          additionalAllowedProjectIds,
          logger,
        });

        const initRiScService = new InitRiScService({
          githubService: gitHubService,
          config: { repoOwner: initRiScRepoOwner, repoName: initRiScRepoName },
        });

        const slackService = slackWebhookUrl
          ? new SlackService({ webhookUrl: slackWebhookUrl, logger })
          : null;

        // Create and mount router
        const router = await createBackendRouter({
          logger,
          httpAuth,
          riScService,
          gcpKmsService,
          initRiScService,
          slackService,
        });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/',
          allow: 'user-cookie',
        });
      },
    });
  },
});
