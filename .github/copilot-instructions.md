# Copilot Instructions

## Project Overview

This is a Backstage frontend plugin called **RiSc** (Risk Scorecard) published as `@kartverket/backstage-plugin-risk-scorecard`. It lets teams create and manage risk assessments with scenarios, actions, risk matrices, and approval workflows. The plugin talks to a separate backend service over REST.

## Commands

### From repo root
```bash
yarn ci                  # Install dependencies (immutable)
yarn dev                 # Start frontend + backend in parallel
yarn start               # Frontend only
yarn pipeline            # Full CI check: install, prettier, lint, tsc
yarn tsc                 # Type check
yarn tsc:full            # Type check without skipLibCheck
yarn lint                # Lint files changed since origin/main
yarn lint:all            # Lint all files
yarn prettier:check      # Check formatting
yarn prettier:format     # Fix formatting
yarn test                # Run tests
yarn test:all            # Run tests with coverage
```

### From `plugins/ros/`
```bash
yarn test                              # Run all plugin tests
yarn test -- --testPathPattern=hooks   # Run a single test file by pattern
yarn start                             # Run plugin in isolation (dev mode)
yarn tsc                               # Type check plugin only
```

### Dependency management
```bash
yarn backstage:upgrade       # Upgrade all @backstage/* packages (always use this, never edit manually)
yarn upgrade-interactive     # Upgrade non-Backstage packages
```

## Architecture

### Monorepo layout
- `plugins/ros/` — The RiSc plugin (all feature code lives here)
- `packages/app/` — Backstage app shell
- `packages/backend/` — Backstage backend

### Plugin entry points
- `plugins/ros/src/index.ts` — Public exports
- `plugins/ros/src/PluginRoot.tsx` — Root component with routing and context providers
- `plugins/ros/src/plugin.ts` — Backstage plugin definition

### Context provider hierarchy (defined in `PluginRoot.tsx`)
```
BackstageContextProvider
  └── RiScProvider          ← manages list of RiScs, CRUD, approval, GCP crypto keys
        └── DefaultRiScTypesProvider
              └── ScenarioProvider   ← manages selected/edited scenario and its actions
                    └── RiScPlugin
```
Consume contexts via the exported hooks: `useRiScs()` and `useScenario()`.

### Data flow
1. `useAuthenticatedFetch` (in `utils/hooks.ts`) — wraps `fetchApi` with GitHub/Google/Identity auth tokens; all backend calls go through this hook.
2. `useGithubRepositoryInformation` — reads `backstage.io/view-url` annotation from the catalog entity to derive `owner`/`name` for URL construction.
3. **DTOs** (`utils/DTOs.ts`) — the shapes that travel over the wire. `dtoToRiSc` and `riScToDTOString` convert between DTOs and internal types.
4. **Internal types** (`utils/types.ts`) — the shapes used throughout the UI (e.g. `RiScWithMetadata`, `Scenario`, `Action`).

### Schema versioning & migration
- JSON schemas: `src/risc_schema_en_v*.json` (currently v3.3 through v5.2)
- `latestSupportedVersion` in `utils/constants.ts` controls which version new RiScs are created with
- `MigrationStatus` type tracks per-version migration changes; the backend returns this alongside content so the UI can show migration diffs before approval

### Component library strategy

The codebase uses three UI libraries and is actively migrating toward `@backstage/ui`:

| Library | Status | Use for |
|---|---|---|
| `@backstage/ui` | **Preferred** | New components and when migrating existing ones |
| `@mui/material` (MUI v5) | Current primary | Most existing components |
| `@material-ui/core` (MUI v4) | Legacy | Older components only — do not add new usage |

When writing new UI code, prefer `@backstage/ui` primitives (`Box`, `Flex`, `Text`, `Button`, `Card`, `Dialog`, etc.) over MUI v5. When touching existing MUI v5 components, consider migrating them to `@backstage/ui` as part of the change.

- CSS-in-JS via **Emotion** (`@emotion/styled`, `sx` prop) for MUI components
- Emotion cache is configured in `PluginRoot.tsx` with a `<meta>` insertion point to prevent MUI v4/v5 style ordering conflicts
- CSS custom properties for risk matrix colours are defined under `--ros-*` names
- Common style helpers live in `utils/style.ts`

### Translations
All user-visible strings go through the Backstage translation system. Add entries to `pluginRiScMessages` in `utils/translations.ts`, then access them via:
```ts
const { t } = useTranslationRef(pluginRiScTranslationRef);
t('dictionary.cancel');
```

### Icons
Icons come from **Remixicon** (`remixicon` package), imported via `remixicon/fonts/remixicon.css`. Use `<i className="ri-icon-name" />` syntax.

## Key conventions

- **`@backstage/*` packages use `backstage:^` version range** — never change these manually; always use `yarn backstage:upgrade`.
- **`generateRandomId()`** (from `utils/utilityfunctions.ts`) is used to create IDs for new scenarios and actions client-side.
- **Enums for domain values** — `ThreatActorsOptions`, `VulnerabilitiesOptions`, `ActionStatusOptions` in `utils/constants.ts` are the canonical source for option lists.
- **Risk scoring** uses a logarithmic scale: `Math.pow(20, i + offset)` for both probability and consequence axes; helpers in `utils/risk.ts`.
- **Stores** (`src/stores/`) are thin localStorage wrappers exposed as custom hooks (e.g. `useActionFiltersStorage`).
- **Test files** use `.test.ts` / `.test.tsx` extensions co-located with their source files.

## Versioning & releasing

Releases are fully automated via `build-tools/release.ts` and triggered by pushing a tag through GitHub Actions. **All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/)** — the release script uses them to determine the version bump and generate changelogs automatically.

| Commit prefix | Version bump | Example |
|---|---|---|
| `feat:` | minor | `feat: add risk heatmap export` |
| `fix:` | patch | `fix: correct probability rounding` |
| `feat!:` / `BREAKING CHANGE:` | major | `feat!: remove legacy schema v3` |
| `docs:`, `chore:`, `refactor:`, etc. | none | `chore: update deps` |

To preview what a release would produce without publishing:
```bash
cd build-tools
./release.ts --dry-run
# or with PR comment:
./release.ts --dry-run --pr-number 123
```

The bump rules mirror the CONTRIBUTING.md versioning policy: **major** = breaking/schema/backend change, **minor** = new feature, **patch** = bugfix or cosmetic.
