## Project

This is a Backstage monorepo for the RiSc plugin. RiSc means Risk Scorecard;
RoS is short for Risiko- og Sårbarhetsanalyse in Norwegian.

The main feature code is split across:

- `ros/` - frontend plugin UI and plugin entry points
- `ros-backend/` - backend plugin services and routes
- `ros-common/` - shared types and constants
- `build-tools/` - release tooling workspace

The plugin manages risk assessments with scenarios, actions, risk matrices,
schema migrations, and approval workflows.

## Commands

From the repo root:

```bash
yarn ci                  # Install dependencies from the lockfile
yarn pipeline            # CI checks: install, prettier, lint, typecheck
```

## Tests

When running tests through Backstage, always pass `--watchAll=false` so Jest
exits when the test run completes.

```bash
yarn test -- --watchAll=false
```

`build-tools` uses Vitest, not Backstage/Jest:

```bash
cd build-tools && yarn test
```

## Architecture Landmarks

Frontend plugin entry points:

- `ros/src/index.ts` - public exports
- `ros/src/plugin.ts` - Backstage plugin definition
- `ros/src/PluginRoot.tsx` - routing and provider setup
- `ros/src/routes.ts` - route refs

Important frontend data flow:

- `ros/src/utils/hooks.ts` contains `useAuthenticatedFetch`, which wraps
  Backstage fetch/auth APIs for backend calls.
- `ros/src/utils/DTOs.ts` converts between backend DTOs and UI types.
- `ros/src/utils/types.ts` contains internal UI domain types.
- `ros/src/utils/constants.ts` contains frontend constants and option
  lists.
- `ros/src/stores/` contains localStorage-backed hooks.

Backend landmarks:

- `ros-backend/src/router.ts` defines backend routes.
- `ros-backend/src/services/` contains backend service logic.

Schema versioning:

- Frontend schemas live in `ros/src/risc_schema_en_v*.json`.
- Shared schema/version types live under `ros-common/src/`.
- Keep `latestSupportedVersion` changes consistent across frontend/common/backend
  usage.

## Coding Conventions

- Use `@backstage/ui` for new UI where practical.
- Do not add new `@material-ui/core` (MUI v4) usage.
- Prefer CSS Modules for new component styles.
- Use existing `--ros-*` CSS custom properties from `ros/css/theme.css`
  for plugin styling.
- Put user-visible strings in `pluginRiScMessages` in
  `ros/src/utils/translations.ts` and read them with the Backstage
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
- Before opening a PR, run `yarn pipeline` when practical.
