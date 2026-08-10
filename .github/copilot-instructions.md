# Copilot instructions

## Project

Backstage monorepo for the **RiSc** plugin. "RiSc" is Risk Scorecard;
"RoS" is Norwegian for _Risiko- og Sårbarhetsanalyse_ (same concept).
The plugin manages risk assessments with scenarios, actions, risk matrices,
schema migrations, and approval workflows.

Yarn 4 workspaces, Node 24 (see `mise.toml`):

- `plugins/ros/` – frontend plugin UI and plugin entry points
  (`@kartverket/backstage-plugin-risk-scorecard`)
- `plugins/ros-backend/` – **experimental** Backstage backend plugin, under
  active development. **Not the backend actually used in production.** It
  aims to eventually replace the Kotlin backend and handle the same
  responsibilities (RiSc CRUD, SOPS encrypt/decrypt, GitHub PR lifecycle,
  GCP KMS integration).
- `packages/ros-common/` – shared types, DTOs, constants
  (`@kartverket/ros-common`)
- `build-tools/` – release/versioning tooling (Vitest, ESM, run separately)

The frontend consumes the plugin through a proxy `/risc-proxy` and requires
both Backstage-issued tokens and a GCP access token + GitHub token forwarded
via `Authorization`, `GCP-Access-Token`, `GitHub-Access-Token` headers
(see `plugins/ros/README.md`).

## Backend

The **production backend is a separate Kotlin project** living in a sibling
repo:

- Local checkout (assumed sibling): `../backstage-plugin-risk-scorecard-backend`
- GitHub: `kartverket/backstage-plugin-risk-scorecard-backend`

When the frontend talks about "the backend" (routes, DTOs, encryption,
GitHub PR lifecycle, GCP KMS), it means the Kotlin service — that is what
runs in production and what `plugins/ros/` is currently written against.

`plugins/ros-backend/` in this repo is a **work-in-progress Backstage
plugin** intended to eventually replace the Kotlin backend. It is not yet
production-ready. Treat changes there as experimental and do not assume
parity with the Kotlin backend.

## Commands

From the repo root:

```bash
yarn install --immutable # install from lockfile
yarn prettier:check      # formatting
yarn lint                # ESLint
yarn test                # runs Jest in every workspace + Vitest in build-tools
yarn typecheck           # tsc --noEmit on all four workspaces
yarn kartverket.dev      # boots ../kartverket.dev with this plugin (requires sibling checkout)
```

Package upgrades:

```bash
yarn backstage:upgrade   # bumps @backstage/* packages
yarn iup                 # interactive non-Backstage upgrades
```

Run one workspace test (pass `--watchAll=false` so Jest exits):

```bash
yarn workspace @kartverket/backstage-plugin-risk-scorecard test -- src/utils/hooks.test.tsx --watchAll=false
yarn workspace @kartverket/backstage-plugin-risk-scorecard-backend test -- src/router.test.ts --watchAll=false
```

`build-tools` uses Vitest instead of Jest:

```bash
cd build-tools && yarn test
```

Before opening a PR, run `prettier:check`, `lint`, `typecheck`, and `test`
when practical.

## Architecture landmarks

Frontend entry points (`plugins/ros/src/`):

- `index.ts` – public exports
- `plugin.ts` – Backstage plugin definition
- `PluginRoot.tsx` – routing + provider setup
- `routes.ts` – route refs

Frontend data flow (`plugins/ros/src/utils/`):

- `hooks.ts` exposes `useAuthenticatedFetch`, wrapping Backstage fetch/auth
  for backend calls – use it instead of raw `fetch`.
- `DTOs.ts` converts between backend DTOs and UI types (do not leak DTO
  shapes into components).
- `types.ts` holds internal UI domain types.
- `constants.ts` holds frontend constants and option lists.
- `plugins/ros/src/stores/` – localStorage-backed hooks.

Backend (`plugins/ros-backend/src/`) — **experimental, not production**:

- `router.ts` – Express-style routes registered by the plugin.
- `services/` – one file per capability
  (`RiScService`, `GitHubService`, `GcpKmsService`, `SopsCryptoService`,
  `SchemaService`, `InitRiScService`, `SlackService`, `ComparisonService`).

The **actual** backend the frontend calls in production is the Kotlin
service in `../backstage-plugin-risk-scorecard-backend` — consult that
repo when investigating request/response shapes or backend behaviour the
frontend currently depends on.

Schema versioning is the trickiest cross-cutting concern:

- Frontend schemas: `plugins/ros/src/risc_schema_en_v*.json`
- Backend schemas: `plugins/ros-backend/src/schemas/risc_schema_en_v*.json`
- Shared version enum + `latestSupportedVersion` constant:
  `packages/ros-common/src/constants.ts`. Keep this constant, the schema
  files in both plugins, and any migration logic **in sync** whenever the
  latest supported schema changes.

## Conventions

UI / styling:

- Prefer `@backstage/ui` for new UI where practical.
- Do **not** add new `@material-ui/core` (MUI v4) usage. MUI v5 (`@mui/*`)
  is the current target; see `dependencies.md`.
- Prefer CSS Modules for new component styles.
- Use existing `--ros-*` CSS custom properties from
  `plugins/ros/css/theme.css`.
- Icons: Remixicon classes, imported through `remixicon/fonts/remixicon.css`.

Strings & i18n:

- Put user-visible strings in `pluginRiScMessages` in
  `plugins/ros/src/utils/translations.ts` and read them with the Backstage
  translation hook. Do not inline user-facing English literals.

Tests:

- Co-located with source, `.test.ts` / `.test.tsx`.
- Backstage workspaces run Jest via `backstage-cli package test`;
  `build-tools` runs Vitest.

Dependencies:

- Backstage packages use the `backstage:^` version range. **Do not edit
  those versions manually** – use `yarn backstage:upgrade`.
- `@types/node` and `jest` use the Yarn `catalog:` entries.

ESLint (`eslint.config.mjs`) enforces `@typescript-eslint/no-shadow`,
`react-hooks/rules-of-hooks`, and `react-hooks/exhaustive-deps` (as `warn`).
Unused args must be prefixed `_`.

## Git & releases

- **Squash merge** is used, so the **PR title** is the source of truth for
  the version bump.
- Follow Conventional Commits (default preset):
  - `fix:` → patch
  - `feat:` → minor
  - `feat!:` / `fix!:` / footer `BREAKING CHANGE:` → major
  - `chore:`, `docs:`, etc. → no release
- Major bumps are expected for any RiSc-schema change or anything requiring
  a coordinated backend change.
- `package.json` versions stay at `0.0.0-development` – the publish action
  in `build-tools/` derives the real version from tags + commits and pushes
  to Kartverket's npm registry. Do not hand-bump versions.
- Include a `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
  trailer on commits you author unless the human asks otherwise.
