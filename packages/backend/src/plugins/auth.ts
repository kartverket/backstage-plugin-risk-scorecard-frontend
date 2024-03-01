import {
  createRouter,
  defaultAuthProviderFactories,
  providers,
} from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      ...defaultAuthProviderFactories,

      // This replaces the default GitHub auth provider with a customized one.
      // The `signIn` option enables sign-in for this provider, using the
      // identity resolution logic that's provided in the `resolver` callback.
      //
      // This particular resolver makes all users share a single "guest" identity.
      // It should only be used for testing and trying out Backstage.
      //
      // If you want to use a production ready resolver you can switch to
      // the one that is commented out below, it looks up a user entity in the
      // catalog using the GitHub username of the authenticated user.
      // That resolver requires you to have user entities populated in the catalog,
      // for example using https://backstage.io/docs/integrations/github/org
      //
      // There are other resolvers to choose from, and you can also create
      // your own, see the auth documentation for more details:
      //
      //   https://backstage.io/docs/auth/identity-resolver
      microsoft: providers.microsoft.create({
        signIn: {
          resolver: async (info, ctx) => {
            const {
              result: {
                fullProfile: { displayName, emails },
              },
            } = info;

            const workEmails = emails?.filter(x => x.type === 'work');
            const workEmail =
              workEmails !== undefined && workEmails.length > 0
                ? workEmails[0]
                : null;

            if (!workEmail) throw new Error(`Fant ikke bruker: ${displayName}`);

            const { entity } = await ctx.findCatalogUser({
              entityRef: {
                name: workEmail.value.replace('@', '_'),
              },
            });

            return ctx.signInWithCatalogUser({
              entityRef: {
                kind: entity.kind,
                name: entity.metadata.name,
              },
            });
          },
        },
      }),

      github: providers.github.create({
        signIn: {
          resolver: async (info, ctx) => {
            const {
              result: {
                fullProfile: { username },
              },
            } = info;

            if (!username) throw new Error(`Fant ikke bruker: ${username}`);
            const { entity } = await ctx.findCatalogUser({
              entityRef: { name: username },
            });

            const user = ctx.signInWithCatalogUser({
              entityRef: {
                kind: entity.kind,
                name: entity.metadata.name,
              },
            });

            return user;
          },
        },
      }),
    },
  });
}
