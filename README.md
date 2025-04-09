# Backstage RiSc Plugin

Contains frontend on port `3000` and Backstage backend on port `7007`.

<br>

## Tooling

This project currently uses node v22. It is up to each developer how to install and setup their tools.
`mise` is one of many tools to achieve this. See https://mise.jdx.dev/.

> Be sure to activate mise, see https://mise.jdx.dev/getting-started.html#activate-mise

After installing and activating mise, you can run this following command (it reads from `mise.toml`).

```sh
mise install
```

The correct `node` should now apply locally in this project. Check with:

```sh
node -v
>>> v22.14.0
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

<br>

## Dependency maintenance

Staying up to date on dependencies is an important task. To mitigate an ever increasing technical debt, it should be performed on a regular basis. This section will explain how to upgrade dependencies in this project.

### Upgrade Backstage

Backstage has its own CLI to perform certain tasks in repos. It's available as `backstage-cli` (installed via `yarn`).
One of these tasks is upgrading dependencies. It is unusual to not do this directly in `package.json`, but we trust this tool to know their inter-dependent packages better than us. A Backstage project is a combination of a long list of different plugins, upgrading them manually might cause unexpected conflicts.

You will notice that in `package.json`, where a semver version would be expected, all packages from `@backstage` are annotated with `backstage:^` instead. It signals that these packages are handled by their CLI. This syntax has been set automatically through a combination of `backstage-cli` and a yarn plugin. Backstage has provided an official yarn plugin for this purpose (see config files).

> NOTE: Backstage will not maintain community driven packages, e.g. `@backstage-community`.

For the aformentioned reasons, you should use this command to bump Backstage packages:

```sh
yarn run backstage:upgrade
```

### Other dependencies

Approach:

1. Determine how outdated the packages are (major/minor/patch?)
2. If possible, upgrade only a single package per branch. This is preferable if the version gap is on the larger side.
3. If the package is very far behind, consider bumping only 1 major at a time and merge. Then perform these steps again in a new branch.
4. If necessary, read CHANGELOG and BREAKING CHANGES for any given package.
5. Fix any issues that may arise.

Normal (non-Backstage) dependencies are maintained through `yarn` and `package.json`.
`yarn` provides an interactive tool to both highlight outdated versions and upgrading them.

> IMPORTANT: Do not touch packages from `@backstage` with `backstage:^`

```sh
yarn upgrade-interactive
```

## Publishing a new plugin version

Hvis du vil publisere en ny versjon av pluginen, må du oppdatere versjonene i `plugins/ros/package.json`. Følg semantisk versjonering.

Når den nye versjonen er oppdatert på `main`-branch kan du lage en ny release med tags i GitHub-repoet.

For å lage en ny tag kan du enten gjøre det manuelt på Github, ved å 
- Gå inn på "Releases" i høyre meny på forsiden til repoet
- Trykke "Draft a new release"
- Under "Choose a new tag" definerer du samme versjonsnummer som du oppdaterte repoet til (på formatet vx.x.x)
- Skrive release notes eller trykke "Generate release notes".
- Trykk "Publish release"

Du kan også kjøre følgende i terminalen:

```bash
git tag -a v1.2.3 -m "A message explaining the new version"
git push origin --tags
```

Når tag'en er laget, så vil en Github Action workflow bygge pluginen og publisere den til npm registry'et til Kartverket. Ny versjon skal bli synlig [her]([https://www.npmjs.com/package/@kartverket/backstage-plugin-security-metrics-frontend?activeTab=versions](https://www.npmjs.com/package/@kartverket/backstage-plugin-risk-scorecard)).

Etter det kan brukerne av pluginen bumpe versjonen for å få med de siste endringene.
