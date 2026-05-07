import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { RiScService } from './services/RiScService';
import { GitHubService } from './services/GitHubService';
import { SopsCryptoService } from './services/SopsCryptoService';
import { GcpKmsService } from './services/GcpKmsService';
import { InitRiScService } from './services/InitRiScService';
import { SlackService } from './services/SlackService';
import * as SchemaService from './services/SchemaService';
import * as ComparisonService from './services/ComparisonService';

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
        // Read config
        const sopsAgeKey = config.getOptionalString('ros.sops.ageKey') ?? '';
        const sopsBackendPublicKey =
          config.getOptionalString('ros.sops.backendPublicKey') ?? '';
        const sopsSecurityTeamPublicKey =
          config.getOptionalString('ros.sops.securityTeamPublicKey') ?? '';
        const sopsSecurityPlatformPublicKey =
          config.getOptionalString('ros.sops.securityPlatformPublicKey') ?? '';
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
        const router = await createRouter({
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
