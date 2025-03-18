# Backstage RiSc Plugin

## How to run plugin in Backstage

Before running your Backstage app, you want to configure it, which is done with _app-configs_.

### App-config files

Backstage can be heavily configurated, and depends on configuration files when being built.
These are named `app-config.<env>.yaml`, and in this project two are provided by default. One named `app-config.yaml` and `app-config.production.yaml`.
For local development, you also have to create the file `app-config.local.yaml`. This file contains the configuration needed to run the app locally, and it is added to the .gitignore-file to avoid leaking secrets in case you set them directly.

There are 4 local configurations needed in `app-config.local.yaml` in order to run the app locally: 
- **Setting up local database**:
```yaml
backend:
  database:
    client: better-sqlite3
    connection:
      directory: <ABSOLUTE PATH TO REPO>/db
```
- **Setting up GitHub integration**:
The main part of Backstage is a Software Catalog, which can be loaded from yaml-files in GitHub repositories in your organization.
GitHub auth is therefore required.
```yaml
integrations:
  github:
    - host: github.com
      # This is a Personal Access Token or PAT from GitHub. You can find out how to generate this token, and more information
      # about setting up the GitHub integration here: https://backstage.io/docs/getting-started/configuration#setting-up-a-github-integration
      token: <YOUR GITHUB PERSONAL ACCESS TOKEN>
```
- **Setting up auth modules**:
In order to use Backstage RiSc plugin, users need to authenticate towards Microsoft Entra ID, Google Cloud and GitHub.
You therefore need to set up Google and GitHub OAuth-apps and set up credentials for the apps in `app-config.local.yaml`.
```yaml
auth:
  environment: development
  providers:
    microsoft:
      development:
        tenantId: ${ENTRA_ID_TENANT_ID}
        clientId: ${ENTRA_ID_CLIENT_ID}
        clientSecret: ${ENTRA_ID_CLIENT_SECRET}   
    guest:
      development:
    google:
      development:
        clientId: <GOOGLE CLIENT ID>
        clientSecret: <GOOGLE CLIENT SECRET>
    github:
      development:
        clientId: <GITHUB CLIENT ID>
        clientSecret: <GITHUB CLIENT SECRET>
```
- **Setting up integration towards Microsoft Graph API to retrieve organization data**:
Backstage needs credentials to retrieve users and groups from Microsoft Entra ID, 
which can be used to enrich the Software Catalog with a hierarchical ownership structure.
```yaml
catalog:
  providers:
    microsoftGraphOrg:
      default:
        queryMode: 'advanced'
        user:
          filter: accountEnabled eq true and userType eq 'member'
          select: ['accountEnabled', 'displayName', 'givenName', 'id', 'mail', 'mailNickname', 'userPrincipalName', 'surname', 'companyName', 'userType']
        group:
          filter: >
            startswith(displayName, 'AAD - TF')
        schedule:
          frequency: PT1H
          timeout: PT50M
        tenantId: ${ENTRA_ID_TENANT_ID}
        clientId: ${ENTRA_ID_CLIENT_ID}
        clientSecret: ${ENTRA_ID_CLIENT_SECRET}
```

You can then run Backstage with Backstage RiSc plugin locally by running:

```bash
yarn install
yarn dev
```

