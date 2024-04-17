# [Backstage](https://backstage.io)

To run Backstage locally, run these commands:
```sh
yarn install
yarn dev
```

### Docker

To build the Docker image, run this command:

```sh
docker image build -t backstage .
```

To run the Docker image, run this command:

```sh
docker run -it -p 3000:7007 \
-e GITHUB_APP_ID=${GITHUB_APP_ID} \
-e GITHUB_APP_CLIENT_ID=${GITHUB_APP_CLIENT_ID} \
-e GITHUB_APP_CLIENT_SECRET=${GITHUB_APP_CLIENT_SECRET} \
-e GITHUB_APP_PK=${GITHUB_APP_CLIENT_PK} \
-e AZURE_TENANT_ID=${AZURE_TENANT_ID} \
-e AZURE_CLIENT_ID=${AZURE_CLIENT_ID} \
-e AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET} \
-e GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
-e GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
backstage
```

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

# Spire Risk Authentication of users

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

# Secrets

[Here](https://console.cloud.google.com/security/secret-manager?project=spire-ros-5lmr) you can find all the secrets that are used in Backstage.



# Build Plugin package

```sh
cd plugins/ros
yarn install
yarn tsc
yarn build
yarn publish # remember to set the new version
```

## Configuration
Crete the file `app-config.local.yaml` at root level. 
Paste the content from the GCP secret called [backstage-app-config-local](https://console.cloud.google.com/security/secret-manager/secret/backstage-app-config-local/versions?project=spire-ros-5lmr).
