# Backend Rewrite — Fix Plan

## Current Status

T3 (SOPS Crypto Service) is complete. All SOPS encryption/decryption logic ported from Kotlin to TypeScript in `plugins/ros-backend/src/`.

## Next Task

**T5: Schema Validation & Migration**

The next agent should:

1. Read `BACKEND_REWRITE_FILE_SPEC.md` section for `src/services/SchemaService.ts`
2. Read the Kotlin source files:
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/risc/validation/JSONValidator.kt`
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/risc/utils/Migrations.kt`
3. Port JSON Schema validation (using `ajv` library):
   - Load bundled schemas (v3.2 through v5.2)
   - Detect version from content, validate against matching schema
   - Try JSON parse first, fall back to YAML parse
4. Port migration logic (7 migration steps: 3.2→3.3→4.0→4.1→4.2→5.0→5.1→5.2):
   - Each step transforms JSON structure (rename fields, restructure arrays, add defaults)
   - Track changes per migration step for UI display (MigrationStatus)
5. Write comprehensive tests (each migration step, validation success/failure)
6. Run `yarn pipeline` to verify
7. Commit with conventional commit format + Co-authored-by trailer
8. Update this file: move T5 to Completed, set Next Task to T4 (GitHub Connector)

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
- The `ProcessingStatus` enum doesn't have a generic "error" value — use the closest match (e.g. `FailedToCreateSops` for SOPS errors, `ErrorWhenUpdatingRiSc` for general failures)

## Discovered Issues

- `BACKEND_REWRITE_FILE_SPEC.md`, `BACKEND_REWRITE_PLAN.md`, `BACKEND_REWRITE_PRD.md` had Prettier formatting issues (now fixed, committed with T1)
- The `plugins/ros-backend` and `plugins/ros-common` packages don't appear in lint output yet (0 files checked) — this is expected since they have minimal source so far
- The existing frontend `ProcessingStatus` enum has different values than the Kotlin backend's — the ros-common version aligns with Kotlin. Frontend will need to map between them during migration.
