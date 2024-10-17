# RiSc Plugin

## How to run plugin in Backstage

To run Backstage locally, you only need to run these commands:

```sh
yarn install
yarn dev
```

The Backstage frontend should now be running on http://localhost:3000/, while the Backstage backend should be running on http://localhost:7007/.

You may now set up [the plugin backend](https://github.com/kartverket/backstage-plugin-risk-scorecard-backend). Keep in mind that Backstage needs to be running for the plugin backend to run.

---

### App-config files

Backstage can be heavily configurated, and depends on configuration files when being built.
These are named `app-config.<env>.yaml`, and in this project two are provided by default. One named `app-config.yaml` and `app-config.production.yaml`.
It is recommended to create a separate file for local development `app-config.local.yaml`. This file is added to the .gitignore-file to avoid leaking secrets in case you set them directly, and to be able to (more easily) have personal configurations.

## How to run the plugin in Kartverket.dev locally

> 💡 Do not run `yarn install` in the kartverket.dev repository before the files below has been set up correctly.
> If the code changes in the plugin-code does not update as expected, you might have to download the npm package again.
> Delete node_modules and run `yarn install` again to fix.

### auth.ts

Edit _annotations_ in the github provider to use your work email address.
To give Backstage an email in your profile without making your email public on github, you can add it in your code under `signInResolver` in the github provider.

```typescript
async profileTransform(result, ctx) {

/** ********************************************************************
 * Custom transform code goes here!                                   *
 * "info" is the sign in result from the upstream (github here), and  *
 * "ctx" contains useful utilities.                                   *
 **********************************************************************/

return {
  profile: {
    email: 'din@epost.no',
    picture: 'picture',
    displayName: 'Ditt Navn',
  },
};
}
```

### org.yaml

Find a random test user in test_data/org.yaml. Change one of the email addresses to your own (the work email).

```yaml
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  annotations:
    ...
    microsoft.com/email: test@example.com # edit this email
  ...
spec:
  memberOf: []
  profile:
    email: test@example.com # and this email
    ...
```

### package.json

I package.json we want to add the risc plugin.
Add the path for risc locally under _packages_ in _workspaces_.

```json
  "workspaces": {
    "packages": [
      "packages/*",
      "plugins/*",
      "../backstage-plugin-risk-scorecard-frontend/plugins/ros"
    ]
  },

```

> 💡 OS Colima kan få problemer med å installere node-gyp.
> Dette kan løses med å oppdatere versjonnummeret på node-gyp til “^10.0.0”.

### Lerna.json

```yaml
  {
  "packages": [
    "packages/*",
    "plugins/*",
    "path-til-ros-plugin-lokalt-på-din-maskin"
    "f.eks: ../backstage-plugin-risk-scorecard-frontend/plugins/ros"
  ],
  "npmClient": "yarn",
  "version": "0.1.0",
  "$schema": "node_modules/lerna/schemas/lerna-schema.json"
}
```

# Publish new version of plugin package

When you want to publish a new version of the plugin, you need to update the version of the package in plugins/ros/package.json. Try to follow [semantic verison](https://semver.org/) conventions.

When the new version is updated on the `main`-branch, you may add a new version tag to the GitHub repository.

To make a new tag, run the following in your terminal of choice:

```sh
git tag -a v1.2.3 -m "A message explaining the new version"
git push origin --tags
```

When the tag is pushed, a GitHub Action workflow will build the plugin and publish it to npm. After that, users of the package may bump their version to get the latest changes.

# Spire Risk Catalog

We have set up a catalog of entities for this project, which fetches:

## Discovery of components

Components (kind: Component) are fetched from Github, where discovery is set up towards the ["spire-test"](https://github.com/spire-test) organization.
Here, all information from repositories defined in `catalog.providers.github` in `app-config.yaml` is fetched.

This is an example of our github discovery config. Here, we fetch all entities from the main branch of repositories beginning with `kv-ros` and search for the definition set in the file called `.security/catalog-info.yaml`.
To use this, we add an `entityProvider` in `catalog.ts`.

```yaml
github:
  spire-test:
    organization: 'spire-test'
    catalogPath: '.security/catalog-info.yaml'
    filters:
      branch: 'main'
      repository: '^kv-ros-.*$'
    schedule:
      frequency: { minutes: 1440 }
      timeout: { minutes: 3 }
```

If you want to add more, you can look at the documentation for Github found [here](https://backstage.io/docs/integrations/github/discovery), or look at the already existing integrations.

## Discovery of organisational data

We fetch information about the users from two different sources: Github and Microsoft.
This is configured with the same approach as the discovery of components, where we defined the configuration in `app-config.yaml`,
and add the entityProvider in `catalog.ts`.

An important thing to keep in mind:
Discovery can be quite slow when the number of users, groups and entities increases.
Thus, we have tried to limit what we need to fetch when testing, to ensure that we are able to quickly spin up the local environment.

# Spire specific environment - where to find things?

We have configured the login with three different providers: Microsoft Entra ID, GCP and Github.
The configuration of authentication takes place in `auth.providers`, and is used in `auth.ts`.
It is possible to configure this with the number of providers that is desirable.

When you add login with a provider, you also have the opportunity to use `*authApiRef` for that provider. Here, you will get access to id tokens and access tokens.
If the user is not logged in with the provider you want to check the token access for, the user is automatically toggled with a login screen for the provider you want to use by the help of these APIs.
You can look at `hooks.ts` to see how this works.

## Entra ID

Entra ID is now configured to log in with your Bekk account. Because we have configured discovery of organisational data with the Bekk organisation, sessions will be connected to this.

[Here](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/4db9a5d4-74c3-4c7e-bd71-1029f96a099c/isMSAApp~/false)
you can find "App Registration" for Entra ID consent screen / login.

### What is this actually used for?

The Entra user is necessary to do authorisation of the user in the backend app with the help of an ID token.
The validation of tokens is also the reason why we try to issue an access token through a Github App, such that users without a Github user also will be able to reach the documents.

## GCP

Google is used to be able to utilise the logged in user's permissions in GCP, where the key chains have been saved in the KMS.
This approach ensures that the user do not gain access to more than they should.

[Here](https://console.cloud.google.com/apis/credentials/consent?referrer=search&project=spire-ros-5lmr) you can find the OAuth Consent Screen, which is used to log in with GCP.

Note! You have to remember to add all users that take part in the testing of this application to this consent screen.

## Github

Login through Github is as of now not used for anything in particular in risk-as-code (Risk Scorecard), but the idea for the future is to have some of the same
solution set up as GCP has today. That means that if you have a Github user account and you are signed in, we can fetch the user account's own permissions from Github.

[Here](https://github.com/organizations/spire-test/settings/installations) you can find all the apps currently in use. Today, we have one application for the development/local environment and one application for "production".

- [Test application](https://github.com/organizations/spire-test/settings/apps/backstage-ros)
- [Production application](https://github.com/organizations/spire-test/settings/apps/backstage-testis)

All environment variables for the test environment can be found in Google Cloud under the [spire-kartverket-ros project](https://console.cloud.google.com/apis/credentials/consent?referrer=search&project=spire-ros-5lmr).

# Secrets

[Here](https://console.cloud.google.com/security/secret-manager?project=spire-ros-5lmr) you can find all the secrets that are used in Backstage.

# Configuration

Crete the file `app-config.local.yaml` at root level.
Paste the content from the GCP secret called [backstage-app-config-local](https://console.cloud.google.com/security/secret-manager/secret/backstage-app-config-local/versions?project=spire-ros-5lmr).
