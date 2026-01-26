# Backstage RiSc Plugin

Contains frontend on port `3000` and Backstage backend on port `7007`.

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

This repo utilizes a home made script located in the [build-tools](./build-tools/) workspace to automatically publish new versions of the plugin (as a NPM package) for each PR that is merged. This uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) in combination with our [GitHub tags](https://github.com/kartverket/backstage-plugin-risk-scorecard-frontend/tags) to determine the next version. This means that if no commits in a PR dictates that a new version should be published, that particular PR will not result in a new published version. NOTE that conventional commits comes in several flavours. So a simple summary of kinds of commits is given below (we use the [default preset](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-conventionalcommits)).

The publish action will comment on the PR with what type of change merging would result in. Note that this is only guaranteed to be valid at the time the comment was created. If another PR is merged before yours, the resulting version will be different. But the actual bump will be the same.

For example:

Your PR results in the version going from 13.36.0 to 13.37.0 since you had at least one commit with `feat:` in it.
Then, another similar PR is merged before yours, so the LIVE version on GitHub and NPM is then 13.37.0. When your PR is merged, the new version will then be 13.38.0. Still a minor version bump, but the base has changed from when your PR was first created.

When a PR with an actual version change is merged, the new version of the plugin will be pushed to Kartverket's npm registry. The new version should be visible [here](https://www.npmjs.com/package/@kartverket/backstage-plugin-risk-scorecard).

But what if two PR's are merged at the same time :scream:? Don't worry. There's a concurrency group in place in the pubish action that makes sure that no two runs on main happes at the same time. This also applies for PRs, but since you probably only care about your most recent push, any previous run of the publish action (which runs in dry-run mode for PRs) will simply be cancelled.

After that, users of the plugin can bump the version to include the latest changes.

NOTE: The version in the plugin's package.json will never change in the source code. There are many [valid reasons](https://semantic-release.gitbook.io/semantic-release/support/faq#why-is-the-package.jsons-version-not-updated-in-my-repository) for this, but the primary is that this would require the publish action (a bot basically) to be able to commit directly on the main branch.

### What version to publish?

See [CONTRIBUTING.md](./CONTRIBUTING.md#versioning)

### Example commits and resulting version bumps

```text
fix: This is a fix, which will bump the patch portion of the version (13.37.0 --> 13.37.1)
feat: This is a new feature, which will bump the minor portion of the version (13.36.0 --> 13.37.0)
feat!: This is also a new feature but with a BANG

BREAKING CHANGE: this line is strictly OPTIONAL. The !: is enough to trigger a new major bump (13.37.0 --> 14.0.0)
chore: This is actually also a breaking change :/

BREAKING CHANGE: Because whenever you have BREAKING CHANGE at the start of the line below, it will treat it as a new major
```

All other commits will not yield any version bump, but feel free to use prefixes like `chore`, `skip` or `docs` so signalize intent (but it's not that much of a big deal).
