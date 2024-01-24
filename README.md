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
