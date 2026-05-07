# Backend Rewrite — Fix Plan

## Current Status

T2 (Define Shared Types and Constants) is complete. All domain types, DTOs, and constants are ported from Kotlin to `plugins/ros-common/src/`.

## Next Task

**T3: SOPS Crypto Service**

The next agent should:

1. Read `BACKEND_REWRITE_FILE_SPEC.md` section for `ros-backend/services/sopsService.ts`
2. Read the Kotlin source files:
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/crypto/sops/SopsCryptoService.kt`
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/crypto/sops/model/SopsConfig.kt`
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/crypto/CryptoServiceInterface.kt`
3. Study how the frontend currently invokes encryption/decryption (search for `sops` in `plugins/ros/src/`)
4. Implement `plugins/ros-backend/src/services/sopsService.ts`:
   - Interface `CryptoService` with `encrypt(plaintext, sopsConfig)` and `decrypt(ciphertext, sopsConfig)` methods
   - Implementation `SopsCryptoService` that shells out to the `sops` CLI binary
   - Handle SOPS config (key groups, GCP KMS, age keys, shamir threshold)
   - Proper error handling: throw typed errors for decrypt/encrypt failures
   - Use types from `@internal/backstage-plugin-risk-scorecard-common` (the ros-common package)
5. Add any needed dev dependencies (e.g. if using `execa` for subprocess execution)
6. Verify `yarn tsc` and `yarn pipeline` pass
7. Commit with conventional commit format + Co-authored-by trailer
8. Update this file: move T3 to Completed, set Next Task to T4

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

## Discovered Issues

- `BACKEND_REWRITE_FILE_SPEC.md`, `BACKEND_REWRITE_PLAN.md`, `BACKEND_REWRITE_PRD.md` had Prettier formatting issues (now fixed, committed with T1)
- The `plugins/ros-backend` and `plugins/ros-common` packages don't appear in lint output yet (0 files checked) — this is expected since they have minimal source so far
- The existing frontend `ProcessingStatus` enum has different values than the Kotlin backend's — the ros-common version aligns with Kotlin. Frontend will need to map between them during migration.
