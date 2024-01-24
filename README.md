# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
yarn dev
```

### Docker

To build the docker image, run:

```sh
docker image build -t backstage .
```

To run the docker image, run:

```sh
docker run -it -p 3000:7007 -e GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID} -e GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET} backstage
```

## Github Access Token

For å kjøre lokalt må du legge til en access token for github-integrasjonen. Denne brukes blant annet til å hente
eniteter og brukerinformasjon.
Lag en `Personal Access Token` i github med disse tilgangene:

- repo
- read:org
- read:user, user:email

Du kan velge om du vil sette environment-variabel

```sh
export GITHUB_TOKEN=<personal access token>
```

eller lage/oppdatere `app-config.local.yaml` med

```yaml
integrations:
  github:
    - host: github.com
      token: <personal access token>
```
