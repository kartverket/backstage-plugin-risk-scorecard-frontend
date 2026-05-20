# Risk Scorecard (RiSc)

This is a plugin for Backstage that helps you and your team when working continuously with risk analysis (:).

## Frontend 
To run the frontend, you will need to have:
- A local clone of a complete Backstage app. 
- A local app-config.local.yaml file.

This RiSc plugin can then be linked to said Backstage app using `--link`.

## Using with kartverket.dev

To configure usage of this plugin with the kartverket.dev Backstage application, please utilize the startPlugin.sh bash script.

## Backend 
The plugin is dependent on a backend service in order to decrypt and communicate with GitHub, and some configuration is necessary for them to communicate. This is not included in this plugin repository, but rather as a part of kartverket.dev.

Note that it will look for a backend on localhost:8080!

Happy RiSc-ing 🌹

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

### ⚠️ A note about merge method ⚠️

As of writing we are using squash to merge. This has the unfortunate consequence of making the PR title the sole source of determining what kind of bump will be done when the release process is run on main. This makes the use of titles with `!` to indicate major changes the safest, though it should work if the first line in the PR-description is "BREAKING CHANGE: some description" as well. However, use `feat!: ` or `fix! ` to be sure. During the release process the PR title will be validated against the commits on your branch. If they don't indicate the same version bump, the action will fail. If so, just rename your PR and the action will rerun automatically.

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
