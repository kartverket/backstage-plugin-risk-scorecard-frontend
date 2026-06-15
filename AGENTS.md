## Project

This is a Backstage monorepo for the RiSc plugin. RiSc means Risk Scorecard;
RoS is short for Risiko- og Sårbarhetsanalyse in Norwegian.

The main feature code is split across:

- `plugins/ros/` - frontend plugin UI and plugin entry points
- `plugins/ros-backend/` - backend plugin services and routes
- `packages/ros-common/` - internal lib with shared types and constants. Not used outside this repo.
- `build-tools/` - release tooling workspace

The plugin manages risk assessments with scenarios, actions, risk matrices,
schema migrations, and approval workflows.

## Commands

From the repo root:

```bash
yarn install --immutable # Install dependencies from the lockfile
yarn prettier:check      # Check formatting
yarn lint                # Run ESLint
yarn test                # Run package tests
yarn typecheck           # Run TypeScript checks
```

When running a specific Backstage workspace test directly, pass
`--watchAll=false` so Jest exits when the test run completes:

```bash
yarn workspace @kartverket/backstage-plugin-risk-scorecard test -- src/utils/hooks.test.tsx --watchAll=false
```

Run `build-tools` tests directly with Vitest:

```bash
cd build-tools && yarn test
```

## Architecture Landmarks

Frontend plugin entry points:

- `plugins/ros/src/index.ts` - public exports
- `plugins/ros/src/plugin.ts` - Backstage plugin definition
- `plugins/ros/src/PluginRoot.tsx` - routing and provider setup
- `plugins/ros/src/routes.ts` - route refs

Important frontend data flow:

- `plugins/ros/src/utils/hooks.ts` contains `useAuthenticatedFetch`, which wraps
  Backstage fetch/auth APIs for backend calls.
- `plugins/ros/src/utils/DTOs.ts` converts between backend DTOs and UI types.
- `plugins/ros/src/utils/types.ts` contains internal UI domain types.
- `plugins/ros/src/utils/constants.ts` contains frontend constants and option
  lists.
- `plugins/ros/src/stores/` contains localStorage-backed hooks.

Backend landmarks:

- `plugins/ros-backend/src/router.ts` defines backend routes.
- `plugins/ros-backend/src/services/` contains backend service logic.

Schema versioning:

- Frontend schemas live in `plugins/ros/src/risc_schema_en_v*.json`.
- Shared schema/version types live under `packages/ros-common/src/`.
- Keep `latestSupportedVersion` changes consistent across frontend/common/backend
  usage.

## Coding Conventions

- Use `@backstage/ui` for new UI where practical.
- Do not add new `@material-ui/core` (MUI v4) usage.
- Prefer CSS Modules for new component styles.
- Use existing `--ros-*` CSS custom properties from `plugins/ros/css/theme.css`
  for plugin styling.
- Put user-visible strings in `pluginRiScMessages` in
  `plugins/ros/src/utils/translations.ts` and read them with the Backstage
  translation hook.
- Icons use Remixicon classes, imported through `remixicon/fonts/remixicon.css`.
- Test files are co-located with source files and use `.test.ts` or
  `.test.tsx`.

## Dependencies

- Backstage packages use the `backstage:^` version range. Do not edit those
  versions manually.
- Use `yarn backstage:upgrade` for Backstage package upgrades.
- Use `yarn iup` for interactive non-Backstage dependency upgrades.

## Git And Releases

- Commit messages should follow Conventional Commits.
- Use `feat:` for minor releases, `fix:` for patch releases, and `feat!:` or
  `BREAKING CHANGE:` for major releases.
- Before opening a PR, run `prettier`, `lint`, `typecheck` and `test` when practical.
