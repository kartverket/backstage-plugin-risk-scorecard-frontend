import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-catalog-backend-module-scaffolder-entity-model';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  defaultUserTransformer,
  GithubEntityProvider,
  GithubOrgEntityProvider,
  GithubUser,
} from '@backstage/plugin-catalog-backend-module-github';
import { MicrosoftGraphOrgEntityProvider } from '@backstage/plugin-catalog-backend-module-msgraph';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  const githubOrgProvider = GithubOrgEntityProvider.fromConfig(env.config, {
    id: 'production',
    orgUrl: 'https://github.com/bekk',
    logger: env.logger,
    schedule: env.scheduler.createScheduledTaskRunner({
      frequency: { minutes: 1440 },
      timeout: { minutes: 15 },
    }),
    userTransformer: async (user: GithubUser, ctx) => {
      const entity = await defaultUserTransformer(user, ctx);
      if (entity && user.organizationVerifiedDomainEmails?.length) {
        entity.spec.profile!.email = user.organizationVerifiedDomainEmails[0];
      }
      
      return entity;
    },
  });
  builder.addEntityProvider(githubOrgProvider);

  builder.addEntityProvider(
    MicrosoftGraphOrgEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      scheduler: env.scheduler,
    }),
  );

  const githubEntityProvider = GithubEntityProvider.fromConfig(env.config, {
    logger: env.logger,
    scheduler: env.scheduler,
  });

  builder.addEntityProvider(githubEntityProvider);

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
