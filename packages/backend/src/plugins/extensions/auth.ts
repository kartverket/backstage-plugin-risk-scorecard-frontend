import {
  BackendModuleRegistrationPoints,
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { AuthenticationError } from '@backstage/errors';
import { getDefaultOwnershipEntityRefs } from '@backstage/plugin-auth-backend';
import { microsoftAuthenticator } from '@backstage/plugin-auth-backend-module-microsoft-provider';
import { jwtDecode } from 'jwt-decode';

interface JWTClaims {
  oid: string;
  [key: string]: any;
}

function getObjectIdFromToken(token: string): string {
  const decodedToken: JWTClaims = jwtDecode<JWTClaims>(token);
  return decodedToken.oid;
}

export const authModuleMicrosoftProvider = createBackendModule({
  pluginId: 'auth',
  moduleId: 'microsoftGraphProvider',
  register(reg: BackendModuleRegistrationPoints) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
      },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'microsoft',
          factory: createOAuthProviderFactory({
            authenticator: microsoftAuthenticator,
            async signInResolver(info, ctx) {
              const { result } = info;

              if (!result.session.accessToken) {
                throw new AuthenticationError(
                  'Login failed, OAuth session did not contain an access token',
                );
              }

              const oid = getObjectIdFromToken(result.session.accessToken);
              const { entity } = await ctx.findCatalogUser({
                annotations: {
                  'graph.microsoft.com/user-id': oid,
                },
              });
              if (!entity) {
                throw new AuthenticationError(
                  'Authentication failed',
                  'No user found in catalog',
                );
              }
              const ownershipRefs = getDefaultOwnershipEntityRefs(entity);
              return ctx.issueToken({
                claims: {
                  sub: stringifyEntityRef(entity),
                  ent: ownershipRefs,
                },
              });
            },
          }),
        });
      },
    });
  },
});
