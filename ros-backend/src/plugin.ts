import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { RiScService } from './services/risc/RiScService.ts';
import { GitHubAdapter } from './services/risc/storage/GitHubAdapter.ts';
import { SopsService } from './services/sops/SopsService.ts';
import { KeyManagementService } from './services/key-management/KeyManagementService.ts';
import { InitialRiScService } from './services/risc/initial/InitialRiScService.ts';
import { SlackAdapter } from './services/slack/SlackAdapter.ts';
import * as SchemaService from './services/risc/schema/SchemaService.ts';
import * as ComparisonService from './services/risc/comparison/RiScComparisonService.ts';

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
        const gitHubService = new GitHubAdapter();
        const cryptoService = new SopsService({
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

        const gcpKmsService = new KeyManagementService({
          additionalAllowedProjectIds,
          logger,
        });

        const initRiScService = new InitialRiScService({
          githubService: gitHubService,
          config: { repoOwner: initRiScRepoOwner, repoName: initRiScRepoName },
        });

        const slackService = slackWebhookUrl
          ? new SlackAdapter({ webhookUrl: slackWebhookUrl, logger })
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
