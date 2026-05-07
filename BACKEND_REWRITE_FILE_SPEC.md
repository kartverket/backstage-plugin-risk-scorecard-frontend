# Backend Rewrite — File-Level Implementation Spec

This document maps every file in the new TypeScript backend plugin to the Kotlin source it replaces, describes the specific changes required, and estimates complexity.

## Complexity Scale

| Rating | Meaning |
|--------|---------|
| 🟢 Trivial | <50 LoC, boilerplate or 1:1 translation, no business logic |
| 🟡 Moderate | 50–200 LoC, straightforward logic but requires careful mapping |
| 🟠 Complex | 200–500 LoC, significant business logic, concurrency, or many edge cases |
| 🔴 Very Complex | 500+ LoC, state machines, multi-service orchestration, or subtle correctness requirements |

---

## Package: `plugins/ros-common/`

Shared types consumed by both frontend and backend.

### `src/types.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `risc/models/RiSc.kt` (520 lines), `risc/models/DTOs.kt` (216 lines), `risc/models/RiScWrapperObject.kt`, `risc/models/InternDifference.kt` |
| **What to do** | Extract and consolidate ~30 core domain types: `RiSc`, `RiScVersion`, `Scenario`, `Action`, `RiScValuation`, `ThreatActor`, `Vulnerability`, `RiScStatus`, `ContentStatus`, `ProcessingStatus`, `MigrationStatus`, `RiScIdentifier`. Versioned model variants (`RiSc3X`, `RiSc4X`, `RiSc5X`) can be union-typed. Align with existing frontend `utils/types.ts` where possible. |
| **Complexity** | 🟡 Moderate — many types but mechanical extraction |

### `src/dtos.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `risc/models/DTOs.kt`, `github/models/GithubRequest.kt` (85 lines), `github/models/GithubResponse.kt` (153 lines), `google/model/DTOs.kt` (35 lines), `slack/models/SlackMessageDTO.kt` |
| **What to do** | Define wire-format interfaces for all API request/response bodies. ~40 types total. Include GitHub API DTOs (file, PR, ref, commit), GCP DTOs, Slack DTO. |
| **Complexity** | 🟡 Moderate — large surface but purely declarative |

### `src/constants.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `config/AppConstants.kt`, hardcoded values in `GithubHelper.kt`, `Migrations.kt` |
| **What to do** | Consolidate: schema version list, file naming conventions (`risc-draft/`, `.ros_<id>.yaml`), branch prefix, supported RiSc versions, risk matrix constants. |
| **Complexity** | 🟢 Trivial |

### `src/index.ts`

| Attribute | Detail |
|-----------|--------|
| **What to do** | Barrel export of all shared types/constants. |
| **Complexity** | 🟢 Trivial |

---

## Package: `plugins/ros-backend/`

The Backstage backend plugin.

### `src/plugin.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `RiScApplication.kt` |
| **What to do** | `createBackendPlugin` with ID `'ros'`. Register router, config, logger, auth dependencies. Standard Backstage new backend system pattern. |
| **Complexity** | 🟢 Trivial — pure boilerplate |

### `src/router.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `risc/RiScController.kt` (215 lines), `google/GoogleControllerIntegration.kt` (22 lines), `initRiSc/InitRiScController.kt` (31 lines) |
| **What to do** | Express router with these endpoints (matching Kotlin API exactly): |

```
GET    /risc/:owner/:repo/:version/all       → fetchAllRiScs
GET    /risc/:owner/:repo/:id                 → fetchRiSc (single)
GET    /risc/:owner/:repo/:id/difference      → fetchDifference
POST   /risc/:owner/:repo                     → createRiSc
PUT    /risc/:owner/:repo/:id                 → updateRiSc
DELETE /risc/:owner/:repo/:id                 → deleteRiSc
POST   /risc/:owner/:repo/publish/:id         → publishRiSc
GET    /google/gcpCryptoKeys                  → fetchGcpCryptoKeys
GET    /initrisc                              → fetchDefaultRiScTypeDescriptors
POST   /slack/feedback                        → sendSlackFeedback
```

| | |
|-----------|--------|
| **Details** | Extract `GCP-Access-Token` and `GitHub-Access-Token` headers. Apply Backstage identity auth middleware. Route to service methods. Map service errors → HTTP responses (port `GlobalExceptionHandler.kt` logic, 219 lines). |
| **Complexity** | 🟡 Moderate — many routes but thin delegation; error mapping is the tricky part |

### `src/services/RiScService.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `risc/RiScService.kt` (661 lines) |
| **What to do** | Port the core orchestrator: |

| Method | Logic |
|--------|-------|
| `fetchAllRiScs` | Parallel fetch: published files (main branch) + draft branches + open PRs. Decrypt each. Migrate. Validate. Merge into unified status view. |
| `fetchRiSc` | Fetch single by ID, determine status (published/draft/approval). |
| `fetchDifference` | Compare draft content vs published content, return structured diff. |
| `createRiSc` | Generate ID, optionally apply template, encrypt with SOPS, push to draft branch. |
| `updateRiSc` | Validate schema, encrypt, push to existing draft branch. Handle conflict detection (SHA comparison). |
| `deleteRiSc` | Status-dependent: delete branch (draft), close PR + delete branch (sent-for-approval), push deletion commit (published). |
| `publishRiSc` | Create PR from draft branch → main. |

| | |
|-----------|--------|
| **Key challenges** | Coroutine concurrency → `Promise.all`/`Promise.allSettled`. Status state machine (`Published`, `Draft`, `SentForApproval`, `MigratedBySchemaChange`). Error-as-control-flow pattern (Kotlin exceptions → TS Result type or try/catch). Integration of 5 sub-services. |
| **Complexity** | 🔴 Very Complex — this is the hardest file in the rewrite |

### `src/services/GitHubService.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `github/GithubConnector.kt` (1294 lines), `github/GithubHelper.kt` (287 lines), `github/GitHubAppService.kt` (80 lines), `github/GithubRiscMetadata.kt` (116 lines) |
| **What to do** | Port all GitHub operations using Octokit (from `@backstage/integration`): |

| Operation | Kotlin method(s) | Notes |
|-----------|-----------------|-------|
| Fetch published RiSc files | `fetchRiScGithubMetadata`, `fetchPublishedRiSc` | List files matching pattern on default branch |
| Fetch draft content | `fetchDraftedRiScContent`, `fetchBranchAndMainRiScContent` | Read from `risc-draft/<id>` branches |
| List open PRs | `fetchAllPullRequests` | Filter by branch prefix |
| Create branch | `createNewBranch` | From HEAD of default branch |
| Write file | `putFileRequestToGithub` | Create-or-update with SHA for conflict detection |
| Delete file | (delete payload) | Used for RiSc deletion |
| Create PR | `createPullRequestForRiSc` | Draft → main |
| Close PR + delete branch | Cleanup on delete | |
| Fetch repo info | `fetchRepositoryInfo` | Permission check |
| Fetch init templates | `fetchInitRiScDescriptorConfigs`, `fetchInitRiSc` | From configured template repo |

| | |
|-----------|--------|
| **Key challenges** | Dual-token pattern: use Backstage `GithubCredentialsProvider` for App token (reads) vs user's personal token (writes). Branch naming conventions. Content encoding (base64). Conflict detection via SHA. The 1294-line connector has significant concurrency with `async`/`awaitAll`. |
| **Complexity** | 🔴 Very Complex — largest single file, many API calls, dual-auth |

### `src/services/SopsCryptoService.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `crypto/sops/SopsCryptoService.kt` (235 lines), `crypto/sops/SopsCryptoValidation.kt` (32 lines), `crypto/sops/Bech32.kt`, `crypto/sops/YamlInstance.kt` |
| **What to do** | Implement SOPS subprocess wrapper: |

| Method | What it does |
|--------|-------------|
| `encrypt(content, sopsConfig)` | Write temp `.sops.yaml` config → spawn `sops encrypt` → return encrypted YAML |
| `decrypt(encryptedYaml)` | Spawn `sops decrypt` → return plaintext JSON |
| `extractSopsConfig(encryptedYaml)` | Parse YAML header to extract key groups (GCP KMS + Age keys) |

| | |
|-----------|--------|
| **Details** | Set env vars: `GOOGLE_OAUTH_ACCESS_TOKEN` (from request header), `SOPS_AGE_KEY` (from server config). Parse SOPS errors into domain errors (`MISSING_DATA_KEY`, `NO_MATCHING_KEY`, `AUTHENTICATION_FAILED`). Validate GCP token format (base64) and Age key format (bech32). Temp file lifecycle management. |
| **Complexity** | 🟠 Complex — subprocess management, temp files, error parsing, env var injection |

### `src/services/SchemaService.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `validation/JSONValidator.kt` (106 lines), `utils/Migrations.kt` (684 lines) |
| **What to do** | Two responsibilities: |

**Validation:**
- Load bundled JSON schemas (v3.2 through v5.2 — 8 schemas)
- Validate RiSc content against schema using `ajv`
- Try JSON parse first, fall back to YAML parse
- Detect version from content, validate against matching schema

**Migration:**
- Port 7 migration steps: `3.2→3.3`, `3.3→4.0`, `4.0→4.1`, `4.1→4.2`, `4.2→5.0`, `5.0→5.1`, `5.1→5.2`
- Each step transforms the JSON structure (rename fields, restructure arrays, add defaults)
- Track changes per migration step for UI display (`MigrationStatus`)
- Return both migrated content and change manifest

| | |
|-----------|--------|
| **Key challenges** | 684 lines of migration logic with nested transforms. Each migration step modifies scenario/action structure differently. Change tracking adds another dimension. Must preserve exact Kotlin behavior to avoid data corruption. |
| **Complexity** | 🔴 Very Complex — correctness-critical, many structural transforms, change tracking |

### `src/services/ComparisonService.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `utils/comparison/Comparison.kt` (653 lines), `utils/comparison/ComparisonDTOs.kt` (230 lines), `utils/comparison/MigrationDTOs.kt` (142 lines) |
| **What to do** | Port the RiSc diff/comparison engine: |

- Compare two RiSc objects field-by-field
- Track property-level changes: `Added`, `Deleted`, `Changed`, `ContentChanged`, `Unchanged`
- Version-aware comparison (different structures for 3.x/4.x/5.x)
- Produce structured change DTOs for frontend rendering
- Also produce migration change DTOs (showing what each schema migration modified)

| | |
|-----------|--------|
| **Key challenges** | 653 lines of recursive comparison logic across 3 schema versions. Each version has different scenario/action shapes. Must handle list reordering (scenarios matched by ID, not position). |
| **Complexity** | 🔴 Very Complex — recursive diff with version polymorphism |

### `src/services/GcpKmsService.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `google/GoogleServiceIntegration.kt` (171 lines), `infra/connector/GcpKmsApiConnector.kt` (8 lines), `infra/connector/GcpCloudResourceApiConnector.kt` (8 lines) |
| **What to do** | Port GCP integration: |

| Method | What it does |
|--------|-------------|
| `validateAccessToken(token)` | Call Google tokeninfo endpoint |
| `fetchProjectIds(token)` | Call Cloud Resource Manager, filter by `-prod-` suffix and allowed list |
| `getGcpCryptoKeys(token)` | For each project: check IAM permissions, list KMS key rings, list crypto keys |

| | |
|-----------|--------|
| **Details** | Parallel IAM permission checks across projects (`Promise.all`). Filter projects by naming convention. Construct KMS resource paths. Use `node-fetch` or Backstage's `fetchApi` with bearer token. |
| **Complexity** | 🟡 Moderate — straightforward HTTP calls, but parallel logic and resource path construction |

### `src/services/InitRiScService.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `initRiSc/InitRiScServiceGitHubImpl.kt` (148 lines), `initRiSc/model/RiScTypeDescriptor.kt` (25 lines), `initRiSc/model/GenerateRiScRequestBody.kt` (9 lines) |
| **What to do** | Fetch RiSc templates from a configured GitHub repository: |

| Method | What it does |
|--------|-------------|
| `getInitRiScDescriptors()` | Fetch descriptor config file listing available templates |
| `getInitRiSc(descriptorId)` | Fetch specific template, validate schema, normalize action statuses to `NOT_OK`, strip timestamps |

| | |
|-----------|--------|
| **Details** | Uses GitHubService for actual file fetching. Template repo configured via `app-config.yaml`. Clean up template content (remove dates, reset statuses). |
| **Complexity** | 🟡 Moderate — clear logic, but depends on GitHubService |

### `src/services/SlackService.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `slack/SlackService.kt` (22 lines), `slack/SlackConnector.kt` |
| **What to do** | POST a JSON payload to a configured Slack webhook URL. Single method: `sendFeedback(message: SlackMessageDTO)`. Read webhook URL from config. |
| **Complexity** | 🟢 Trivial — single HTTP POST |

### `src/services/AuthService.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `security/ValidationService.kt` (47 lines), `security/AccessTokenValidationFilter.kt` (49 lines), `security/AccessLogger.kt` |
| **What to do** | Validate request authorization before mutations: |

1. Verify Backstage identity token (built-in middleware — mostly free)
2. Extract GitHub token from header, verify write permission on repo via GitHub API
3. Extract GCP token from header, validate via Google tokeninfo
4. Log access attempts

| | |
|-----------|--------|
| **Details** | In Backstage, identity verification is handled by `httpAuth.credentials()`. The custom part is GitHub permission checking and GCP token validation. Can be Express middleware or per-route guard. |
| **Complexity** | 🟡 Moderate — Backstage provides building blocks, but dual-token validation needs care |

### `src/lib/sops.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | Part of `SopsCryptoService.kt` (process spawning logic) |
| **What to do** | Low-level subprocess wrapper: `spawnSops(args, env, stdin?)` → `{ stdout, stderr, exitCode }`. Handle: timeout, signal handling, stream buffering, error extraction from stderr. |
| **Complexity** | 🟡 Moderate — Node.js `child_process.spawn` with proper stream handling |

### `src/lib/errors.ts`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `exception/` directory (14 exception classes), `exception/GlobalExceptionHandler.kt` (219 lines) |
| **What to do** | Define error hierarchy and HTTP mapping: |

| Error class | HTTP status | Kotlin source |
|-------------|-------------|---------------|
| `AccessTokenValidationError` | 401 | `AccessTokenValidationFailedException` |
| `PermissionDeniedError` | 403 | `PermissionDeniedOnGitHubException` |
| `RepositoryAccessError` | 403 | `RepositoryAccessException` |
| `RiScNotValidError` | 422 | `RiScNotValidOnUpdateException`, `RiScNotValidOnFetchException` |
| `RiScConflictError` | 409 | `RiScConflictException` |
| `SopsError` | 500 | `SopsException` |
| `GitHubFetchError` | 502 | `GitHubFetchException` |
| `CreatePullRequestError` | 500 | `CreatePullRequestException` |
| `SchemaFetchError` | 500 | `JSONSchemaFetchException` |

| | |
|-----------|--------|
| **Details** | Each error carries a `ProcessingStatus` enum value for the frontend. The router's error handler maps these to HTTP responses with appropriate bodies. |
| **Complexity** | 🟡 Moderate — many classes but each is simple; the mapping table is the real value |

### `src/__tests__/`

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | `src/test/` (14 test files, ~4861 total test lines, 109 test methods) |
| **What to do** | Port tests per service: |

| Test file | Kotlin source | Tests | Priority |
|-----------|---------------|-------|----------|
| `SopsCryptoService.test.ts` | `SopsCryptoServiceDecryptionTests.kt` + `EncryptionTests.kt` (365 lines, 11 tests) | Mock subprocess, verify encrypt/decrypt/error handling | High |
| `SopsCryptoValidation.test.ts` | `SopsCryptoValidationTests.kt` (56 lines, 7 tests) | Token format validation | Medium |
| `GitHubService.test.ts` | `GithubConnectorTests.kt` (1671 lines, 36 tests) | Mock Octokit, verify all operations | High |
| `SchemaService.test.ts` | `JSONValidatorTests.kt` (188 lines, 14 tests) | Validate against all schema versions | High |
| `Migrations.test.ts` | `MigrationFunctionTests.kt` (695 lines, 13 tests) | Test each migration step with fixtures | Critical |
| `ComparisonService.test.ts` | `ComparisonTests.kt` (734 lines, 7 tests) | Diff correctness per version | High |
| `GcpKmsService.test.ts` | `GoogleServiceIntegrationTests.kt` (422 lines, 9 tests) | Mock HTTP, verify filtering/permissions | Medium |
| `InitRiScService.test.ts` | `InitRiScServiceGitHubImplTests.kt` (304 lines, 3 tests) | Template fetching and cleanup | Low |
| `RiScService.test.ts` | (no direct Kotlin test — tested via integration) | Integration test with mocked sub-services | High |

| | |
|-----------|--------|
| **Test fixtures** | Port from `src/test/resources/`: `3.2.json`, `3.3.json`, `4.0.json`, `4.1.json`, `4.2.json`, `5.0.json` + YAML encryption fixture. Place in `src/__tests__/fixtures/`. |
| **Complexity** | 🟠 Complex — large volume, but each test is mechanical once the service is implemented |

---

## Package: `plugins/ros/` (Frontend Changes)

### `src/urls/backend.ts`

| Attribute | Detail |
|-----------|--------|
| **What to do** | Add native backend URLs alongside existing proxy URLs. When `ros.backend === 'native'`, use Backstage service discovery URLs (`/api/ros/...`) instead of proxy URLs (`/api/proxy/risc-proxy/...`). |
| **Complexity** | 🟢 Trivial |

### `src/utils/hooks.ts`

| Attribute | Detail |
|-----------|--------|
| **What to do** | Read `ros.backend` config value. Branch URL construction based on toggle. When native: use `discoveryApi.getBaseUrl('ros')` for base URL. Remove proxy path prefix. Keep all other logic (token headers, response parsing) identical. |
| **Complexity** | 🟡 Moderate — touches critical path, must maintain backward compat |

### `app-config.yaml` / `app-config.example.yaml`

| Attribute | Detail |
|-----------|--------|
| **What to do** | Add `ros.backend: 'native' | 'legacy'` config option with documentation comments. Default to `'legacy'` for safety during transition. |
| **Complexity** | 🟢 Trivial |

---

## Package: `packages/backend/`

### `src/index.ts`

| Attribute | Detail |
|-----------|--------|
| **What to do** | Register the ROS backend plugin: `backend.add(import('@internal/backstage-plugin-ros-backend'))`. |
| **Complexity** | 🟢 Trivial |

---

## Infrastructure Files

### `Dockerfile` (updated)

| Attribute | Detail |
|-----------|--------|
| **Kotlin source** | Existing Kotlin `Dockerfile` |
| **What to do** | Multi-stage build: (1) Build SOPS from source (`golang:1.25.7`, clone `getsops/sops` v3.12.2). (2) Build Backstage (`node:20`). (3) Runtime image with SOPS binary at `/usr/bin/sops`. Ensure `sops` is executable by the non-root user. |
| **Complexity** | 🟡 Moderate — multi-stage Docker, must match SOPS version exactly |

### `package.json` (root)

| Attribute | Detail |
|-----------|--------|
| **What to do** | Add `plugins/ros-backend` and `plugins/ros-common` to workspaces. |
| **Complexity** | 🟢 Trivial |

---

## Summary: Effort by Complexity

| Complexity | Files | Estimated Total LoC |
|------------|-------|-------------------|
| 🟢 Trivial | 7 files | ~200 |
| 🟡 Moderate | 9 files | ~1,500 |
| 🟠 Complex | 2 files (SopsCryptoService, tests) | ~800 |
| 🔴 Very Complex | 4 files (RiScService, GitHubService, SchemaService, ComparisonService) | ~3,500 |
| **Total** | **22 files** | **~6,000 LoC** |

## Critical Path (files that block others)

```
ros-common/types.ts + constants.ts
        │
        ├── lib/errors.ts
        │       │
        ├── lib/sops.ts ──→ SopsCryptoService.ts
        │                           │
        ├── GitHubService.ts ───────┤
        │                           │
        ├── SchemaService.ts ───────┤
        │       (includes Migrations + Validation)
        │                           │
        └───────────────────→ RiScService.ts ──→ router.ts ──→ plugin.ts
                                    │
                    ComparisonService.ts
                    GcpKmsService.ts
                    InitRiScService.ts
                    SlackService.ts
                    AuthService.ts
```

## Kotlin Source → TypeScript Target Mapping (Quick Reference)

| Kotlin file (lines) | TypeScript target | Notes |
|---------------------|-------------------|-------|
| `RiScService.kt` (661) | `services/RiScService.ts` | Core orchestrator |
| `GithubConnector.kt` (1294) | `services/GitHubService.ts` | Largest file |
| `GithubHelper.kt` (287) | Merged into `GitHubService.ts` | URL builders inline |
| `GitHubAppService.kt` (80) | Merged into `GitHubService.ts` | Use Backstage credentials provider |
| `GithubRiscMetadata.kt` (116) | `ros-common/types.ts` | Status types |
| `SopsCryptoService.kt` (235) | `services/SopsCryptoService.ts` + `lib/sops.ts` | Split: logic vs subprocess |
| `SopsCryptoValidation.kt` (32) | Inline in `SopsCryptoService.ts` | Too small for own file |
| `Migrations.kt` (684) | `services/SchemaService.ts` | Combined with validation |
| `JSONValidator.kt` (106) | `services/SchemaService.ts` | Combined with migrations |
| `Comparison.kt` (653) | `services/ComparisonService.ts` | Standalone |
| `ComparisonDTOs.kt` (230) | `ros-common/dtos.ts` | Wire types |
| `MigrationDTOs.kt` (142) | `ros-common/dtos.ts` | Wire types |
| `GoogleServiceIntegration.kt` (171) | `services/GcpKmsService.ts` | GCP operations |
| `InitRiScServiceGitHubImpl.kt` (148) | `services/InitRiScService.ts` | Template fetching |
| `SlackService.kt` (22) | `services/SlackService.ts` | Webhook POST |
| `ValidationService.kt` (47) | `services/AuthService.ts` | Token validation |
| `AccessTokenValidationFilter.kt` (49) | Middleware in `router.ts` | Express middleware |
| `GlobalExceptionHandler.kt` (219) | Error handler in `router.ts` + `lib/errors.ts` | Error → HTTP mapping |
| `RiScController.kt` (215) | `router.ts` | Express routes |
| `GoogleControllerIntegration.kt` (22) | `router.ts` | Single route |
| `InitRiScController.kt` (31) | `router.ts` | Single route |
| `risc/models/*.kt` (~573) | `ros-common/types.ts` + `ros-common/dtos.ts` | Domain types |
| `github/models/*.kt` (~261) | `ros-common/dtos.ts` | GitHub wire types |
| `config/*.kt` (~29) | `app-config.yaml` + Backstage config reading | Spring → Backstage config |
| `Serializers.kt` (107) | Not needed | TS uses native JSON; dates are strings |
| `Utils.kt` (95) | Inline utilities | `generateRiScId`, base64, etc. |

## Dropped Code (Not Ported)

| Kotlin file | Reason |
|-------------|--------|
| `RiScApplication.kt` | Spring Boot main class → replaced by Backstage plugin |
| `OpenApiConfig.kt` | Spring Swagger config — not needed |
| `SecurityConfig.kt` | Spring Security config → Backstage auth |
| `WebClientConnector.kt` | Spring WebClient base → use `node-fetch`/Backstage fetch |
| `InitRiScServiceAirtableImpl.kt` | Dead code (legacy Airtable integration) |
| `AccessLogger.kt` | Replaced by Backstage Winston logger |
| `SlackConnector.kt` | Merged into `SlackService.ts` (too thin to separate) |
| All `*ApiConnector.kt` (8 lines each) | Spring WebClient base classes → not needed |
