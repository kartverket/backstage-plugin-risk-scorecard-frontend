# Backend Rewrite — Fix Plan

## Current Status

T7 (RiSc CRUD Service / Core Orchestrator) is complete. All CRUD operations ported from Kotlin to TypeScript in `plugins/ros-backend/src/services/RiScService.ts`.

## Next Task

**T8: Supporting Integrations**

The next agent should:

1. Read `BACKEND_REWRITE_FILE_SPEC.md` for T8 (Supporting Integrations)
2. Implement `src/services/InitRiScService.ts` — template fetching from a configured GitHub repo
3. Implement GCP integration (token validation, project IDs, crypto keys) if in scope
4. Wire up the router (`src/router.ts`) to call RiScService methods with proper request/response handling
5. Write tests for new services
6. Run `yarn pipeline` to verify
7. Commit with conventional commit format + Co-authored-by trailer
8. Update this file: move T8 to Completed, set Next Task to T9

## Completed

- [x] T1: Scaffold packages (commit 25bb6a5)
  - `plugins/ros-common/` — package.json, tsconfig, eslintrc, src/index.ts, types.ts (stub), constants.ts
  - `plugins/ros-backend/` — package.json, tsconfig, eslintrc, src/index.ts, plugin.ts, router.ts (with /health endpoint)
  - Registered in `packages/backend/src/index.ts`
  - Workspace deps wired, all checks green

- [x] T2: Define Shared Types and Constants (commit e4f7d98)
  - `plugins/ros-common/src/types.ts` — Full domain types: status enums (ProcessingStatus, RiScStatus, ContentStatus, DifferenceStatus), domain enums (ThreatActor, Vulnerability, Vulnerability3X, ActionStatus, ActionStatus3X4X, valuation enums), versioned RiSc models (3X/4X/5X with scenarios and actions), SOPS config interfaces, migration types (40–52), change tracking (TrackedProperty discriminated union with versioned change types), GCP crypto key types
  - `plugins/ros-common/src/dtos.ts` — Wire-format interfaces: all API response DTOs (RiScContentResultDTO, ProcessRiScResultDTO, CreateRiScResultDTO, PublishRiScResultDTO, DifferenceDTO, etc.), request DTOs, GitHub wire types (file, repo, PR, commit, branch, reference), GitHub request payloads (write/delete file, create PR, create branch), GCP DTOs
  - `plugins/ros-common/src/constants.ts` — Added ALL_RISC_VERSIONS array, RISC_DIRECTORY constant, risk matrix scoring constants (BASE_NUMBER, probability/consequence options)
  - `plugins/ros-common/src/index.ts` — Updated barrel export
  - All checks green (tsc, prettier, lint)

- [x] T3: SOPS Crypto Service (commit 59d4f0c)
  - `plugins/ros-backend/src/lib/sops.ts` — Low-level subprocess wrapper (spawn sops, handle streams, timeout)
  - `plugins/ros-backend/src/lib/errors.ts` — Domain error hierarchy with ProcessingStatus mapping
  - `plugins/ros-backend/src/services/SopsCryptoService.ts` — encrypt, decrypt, extractSopsConfig, token validation, bech32 checksum verification
  - `plugins/ros-backend/src/__tests__/SopsCryptoService.test.ts` — 21 tests (mock spawnSops, error codes, validation)
  - Added `yaml` dependency for SOPS config parsing
  - All checks green (tsc, prettier, lint, tests)

- [x] T5: Schema Validation & Migration (commit e28500b)
  - `plugins/ros-backend/src/services/SchemaService.ts` — Full migration pipeline: validate, detectVersion, migrate, parseContent (JSON/YAML)
  - `plugins/ros-backend/src/schemas/` — Bundled JSON schemas v3.2–v5.2 (copied from frontend + Kotlin backend for v3.2)
  - `plugins/ros-backend/src/__tests__/SchemaService.test.ts` — 41 tests: validation, individual migrations, full chain, version detection, YAML
  - `plugins/ros-backend/src/__tests__/fixtures/` — Test fixtures from Kotlin backend (3.2–5.0 JSON files)
  - Added `ajv`, `ajv-formats` dependencies
  - All checks green (tsc, prettier, lint, tests)

- [x] T4: GitHub Service (commit 6a8b83e)
  - `plugins/ros-backend/src/services/GitHubService.ts` — Full GitHub REST API client: file CRUD (Contents API with base64), branch management (create/delete/list drafts), PR lifecycle (create/close/list), repository info, commits with pagination
  - `plugins/ros-backend/src/__tests__/GitHubService.test.ts` — 38 tests: happy paths and error handling for all operations
  - Exports: `GitHubService` class, `GitHubApiError`, `GithubStatus` enum, `GithubContentResponse`, `RepositoryInfo`
  - Uses plain `fetch` with dependency injection (constructor accepts custom fetch fn)
  - All checks green (tsc, prettier, lint, tests — 100 total across backend)

- [x] T6: Comparison Service (commit 2c51fb0)
  - `plugins/ros-backend/src/services/ComparisonService.ts` — Full RiSc diff engine: recursive comparison across v3.x/v4.x/v5.x, property-level change tracking (Added, Deleted, Changed, ContentChanged, Unchanged), scenarios/actions matched by ID not position, integration with SchemaService.migrate() for cross-version comparison
  - `plugins/ros-backend/src/__tests__/ComparisonService.test.ts` — 29 tests: helper functions, v5.x comparison (identical, title/scope changes, scenario add/delete/reorder, action changes, risk changes, valuations, threat actors, URLs), entry point with migration
  - Exports: `compare`, `comparison5X`, `comparison4X`, `comparison3X`, helper functions, `ComparisonError`
  - All checks green (tsc, prettier, lint, tests — 129 total across backend)

- [x] T7: RiSc CRUD Service / Core Orchestrator (commit 18ef214)
  - `plugins/ros-backend/src/services/RiScService.ts` — Full orchestrator: fetchAllRiScs (parallel with Promise.allSettled, decrypt, validate, migrate), createRiSc (validate, encrypt, create branch, write), updateRiSc (validate, encrypt, ensure branch, SHA conflict detection), deleteRiSc (status-aware: branch delete or staged deletion), publishRiSc (create PR), fetchDifference (decrypt published, compare)
  - `plugins/ros-backend/src/__tests__/RiScService.test.ts` — 24 tests: all methods covered with happy paths, error cases, partial failures, validation/migration failures
  - Helper functions: `generateRiScId()`, `getRiScStatus()` (full state machine from GithubRiscMetadata.kt), `chooseContentFromStatus()`
  - Exports: `RiScService` class, `generateRiScId`, `SchemaServiceAPI` and `ComparisonServiceAPI` interfaces
  - All checks green (tsc, prettier, lint, tests — 153 total across backend)

## In Progress

Nothing — awaiting next agent.

## Learnings

- Workspace config `"packages": ["packages/*", "plugins/*", "build-tools"]` auto-discovers new plugins — no root package.json workspace edit needed
- Backend uses `createBackendPlugin` with `coreServices.httpRouter` pattern
- ESLint requires `.eslintrc.js` with `eslint-factory` in each plugin directory
- The `backstage:^` version range resolves via Backstage CLI's version management — use it for all `@backstage/*` deps
- `"role": "backend-plugin"` and `"role": "common-library"` are the correct Backstage roles
- The Kotlin backend uses `@SerialName` for JSON field names — TypeScript interfaces should use the JSON wire names (snake_case for GitHub/SOPS fields, camelCase for RiSc domain fields)
- Kotlin sealed interfaces map well to TypeScript discriminated unions (e.g. TrackedProperty with `type` discriminator)
- The backend has versioned models (RiSc3X, RiSc4X, RiSc5X) with different scenario/action shapes per version — these are all defined as separate interfaces in TypeScript
- The `SopsConfig` type uses snake_case field names because it matches the SOPS YAML format directly
- Change tracking types (ComparisonDTOs) use a `type` discriminator that maps to Kotlin's `@SerialName` on sealed subclasses
- Backstage CLI uses SWC (via `@backstage/cli-module-test-jest`) to transform TypeScript in tests — don't use `npx jest` directly, use `backstage-cli package test`
- jest.mock factories run in a hoisted scope — avoid TypeScript type annotations inside the factory function; instead mock the module and cast after import
- Bech32 validation: the separator is the LAST `1` in the string; HRP = everything before it (including trailing dash for age keys)
- The SchemaService uses standalone exported functions (not a class) — `migrate(doc, lastPublished?, toVersion?)` returns `[RiScJson, MigrationStatus]`
- `RiScJson = Record<string, unknown>` is the untyped JSON shape; cast to/from typed interfaces (RiSc5X etc.) at comparison boundaries
- Deep equality is needed for comparing JSON objects in lists (valuations have no ID, so use structural equality)
- Jest `--testPathPattern` was replaced by `--testPathPatterns` in newer versions
- The `ProcessingStatus` enum doesn't have a generic "error" value — use the closest match (e.g. `FailedToCreateSops` for SOPS errors, `ErrorWhenUpdatingRiSc` for general failures)
- The Kotlin `generateRiScId` uses `filenamePrefix + "-" + 5 alphanumeric chars` — in our case prefix is `ros_` (matching `RISC_FILE_PREFIX` without the dot) so IDs look like `ros_xY3aB`
- The `getRiScStatus` state machine from `GithubRiscMetadata.kt` has 3 axes: main branch state, draft branch state, PR state — avoid switch statements without defaults (ESLint `default-case` rule) by using if/else chains instead
- ESLint `consistent-return` requires functions to always explicitly return — avoid switch-only logic that relies on exhaustiveness without a final return
- `Promise.allSettled` is the right pattern for `fetchAllRiScs` — one bad RiSc shouldn't block the rest
- The Kotlin `deleteRiSc` lives in GithubConnector (not RiScService) — in our architecture it's split between GitHubService (low-level ops) and RiScService (orchestration logic)
- The `decryptWithSopsConfig` method returns `{ content, sopsConfig }` — the content is the plaintext JSON string, sopsConfig is extracted from the YAML ciphertext
- For unused parameters in TypeScript, prefix with underscore (`_gcpToken`) to satisfy `noUnusedLocals`
- JSON schemas use draft 2020-12 (`$schema: "https://json-schema.org/draft/2020-12/schema"`) — must use `ajv/dist/2020` (Ajv2020), not the default Ajv constructor which only supports draft-07
- ESLint `no-constant-condition` disallows `while (true)` — use a boolean flag pattern (`let hasMore = true; while (hasMore)`) instead
- ESLint `dot-notation` requires property access via dot syntax when key is a valid identifier — use `headers.Authorization` not `headers['Authorization']`
- The Kotlin GithubConnector uses `WebClient` reactively with `awaitBody`/`awaitSingle` — in TypeScript just use async/await with native fetch
- GitHub Contents API returns base64-encoded content with newlines — strip `\n` before decoding
- The Kotlin code uses `token` prefix in Authorization header (not `Bearer`) for GitHub API calls
- The v5_2 schema has a bug: its `$id` is the same as v5_1's — strip `$id`/`$schema` from schemas before compiling to avoid Ajv conflicts
- Backstage lint rule `@backstage/no-relative-monorepo-imports` forbids `../../../ros/src/...` imports — copy shared resources locally or use package imports
- Migration operates on raw JSON objects (not typed models) because the structure changes across versions — use `Record<string, unknown>` with casts
- Use `CI=true` and `--forceExit` when running backstage-cli tests to avoid hanging in watch mode

## Discovered Issues

- `BACKEND_REWRITE_FILE_SPEC.md`, `BACKEND_REWRITE_PLAN.md`, `BACKEND_REWRITE_PRD.md` had Prettier formatting issues (now fixed, committed with T1)
- The `plugins/ros-backend` and `plugins/ros-common` packages don't appear in lint output yet (0 files checked) — this is expected since they have minimal source so far
- The existing frontend `ProcessingStatus` enum has different values than the Kotlin backend's — the ros-common version aligns with Kotlin. Frontend will need to map between them during migration.
