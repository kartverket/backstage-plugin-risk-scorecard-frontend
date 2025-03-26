# Backstage RiSc Plugin

Contains frontend on port `3000` and Backstage backend on port `7007`.

<br>

## Tooling

This project currently uses node v20. It is up to each developer how to install and setup their tools.
`mise` is one of many tools to achieve this. See https://mise.jdx.dev/.

> Be sure to activate mise, see https://mise.jdx.dev/getting-started.html#activate-mise

After installing and activating mise, you can run this following command (it reads from `mise.toml`)

```sh
mise install
```

The correct `node` should now apply locally in this project. Check with:

```sh
node -v
>>> v20.18.3
```

Continue by enabling `yarn` as package manager. `corepack` is used for this, it comes with `node`.
It will read the correct version from `package.json`.

```sh
corepack enable
corepack install
```

<br>

## How to run plugin in Backstage

Before running your Backstage app, you want to configure it, which is done with _app-configs_.

### App-config files

Backstage can be heavily configurated, and depends on configuration files when being built.
These are named `app-config.<env>.yaml`, and in this project two are provided by default. One named `app-config.yaml` and `app-config.production.yaml`.
For local development, you also have to create the file `app-config.local.yaml`. This file contains the configuration needed to run the app locally, and it is added to the .gitignore-file to avoid leaking secrets in case you set them directly.

```sh
cp app-config.example.yaml app-config.local.yaml
```

You can then run Backstage with Backstage RiSc plugin locally by running:

```sh
yarn install
yarn dev
```
