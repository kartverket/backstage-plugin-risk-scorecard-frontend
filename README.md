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
docker run -it -p 3000:7007 \
-e GITHUB_APP_ID=${GITHUB_APP_ID} \
-e GITHUB_APP_CLIENT_ID=${GITHUB_APP_CLIENT_ID} \
-e GITHUB_APP_CLIENT_SECRET=${GITHUB_APP_CLIENT_SECRET} \
-e GITHUB_APP_PK=${GITHUB_APP_CLIENT_PK} \
-e GITHUB_APP_WEBHOOK_SECRET=${GITHUB_APP_WEBHOOK_SECRET} \
-e AZURE_TENANT_ID=${AZURE_TENANT_ID} \
-e AZURE_CLIENT_ID=${AZURE_CLIENT_ID} \
-e AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET} \ 
backstage
```