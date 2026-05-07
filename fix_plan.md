# Backend Rewrite — Fix Plan

## Current Status

T1 (Scaffold Package Structure) is complete. Both `plugins/ros-backend/` and `plugins/ros-common/` are created, wired into the workspace, registered in the backend, and all checks pass.

## Next Task

**T2: Define Shared Types and Constants**

The next agent should:
1. Read `BACKEND_REWRITE_FILE_SPEC.md` sections for `ros-common/types.ts` and `ros-common/dtos.ts`
2. Read the Kotlin source files:
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/risc/models/RiSc.kt` (520 lines — versioned domain models)
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/risc/models/DTOs.kt` (216 lines — API response types)
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/github/models/GithubResponse.kt` (153 lines)
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/github/models/GithubRequest.kt` (85 lines)
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/crypto/sops/model/SopsConfig.kt` (44 lines)
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/utils/comparison/ComparisonDTOs.kt` (230 lines)
   - `../backstage-plugin-risk-scorecard-backend/src/main/kotlin/no/risc/utils/comparison/MigrationDTOs.kt` (142 lines)
3. Also reference the existing frontend types at `plugins/ros/src/utils/types.ts` and `plugins/ros/src/utils/DTOs.ts` — align where possible
4. Flesh out `plugins/ros-common/src/types.ts` with full domain types
5. Create `plugins/ros-common/src/dtos.ts` with wire-format interfaces
6. Update `plugins/ros-common/src/constants.ts` with any missing constants
7. Update `plugins/ros-common/src/index.ts` barrel export
8. Verify `yarn tsc` and `yarn pipeline` pass

## Completed

- [x] T1: Scaffold packages (commit 25bb6a5)
  - `plugins/ros-common/` — package.json, tsconfig, eslintrc, src/index.ts, types.ts (stub), constants.ts
  - `plugins/ros-backend/` — package.json, tsconfig, eslintrc, src/index.ts, plugin.ts, router.ts (with /health endpoint)
  - Registered in `packages/backend/src/index.ts`
  - Workspace deps wired, all checks green

## In Progress

Nothing — awaiting next agent.

## Learnings

- Workspace config `"packages": ["packages/*", "plugins/*", "build-tools"]` auto-discovers new plugins — no root package.json workspace edit needed
- Backend uses `createBackendPlugin` with `coreServices.httpRouter` pattern
- ESLint requires `.eslintrc.js` with `eslint-factory` in each plugin directory
- The `backstage:^` version range resolves via Backstage CLI's version management — use it for all `@backstage/*` deps
- `"role": "backend-plugin"` and `"role": "common-library"` are the correct Backstage roles

## Discovered Issues

- `BACKEND_REWRITE_FILE_SPEC.md`, `BACKEND_REWRITE_PLAN.md`, `BACKEND_REWRITE_PRD.md` had Prettier formatting issues (now fixed, committed with T1)
- The `plugins/ros-backend` and `plugins/ros-common` packages don't appear in lint output yet (0 files checked) — this is expected since they have minimal source so far
