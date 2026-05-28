# Product Requirements Document: Backstage Backend Plugin for RiSc

## Overview

The RiSc (Risk Scorecard) Backstage plugin currently depends on a standalone Kotlin/Spring Boot backend deployed separately on GKE. This creates operational overhead (separate CI/CD, monitoring, scaling, two languages) and slows developer onboarding.

This project consolidates the backend into a TypeScript Backstage backend plugin (`plugins/ros-backend/`) co-located in the frontend monorepo. The new plugin replicates 100% of the Kotlin backend's functionality using the Backstage new backend system. A feature toggle enables gradual migration with instant rollback.

**Success criteria:** All RiSc operations (create, edit, encrypt/decrypt, publish, delete, fetch, migrate) work identically through the new backend, validated by toggling production traffic and comparing behavior.

---

## Tasks

### T1: Scaffold Package Structure

Create the `plugins/ros-backend/` and `plugins/ros-common/` packages with correct workspace wiring.

**Acceptance Criteria:**

- [ ] `plugins/ros-common/` exists with `package.json`, `tsconfig.json`, `src/index.ts`
- [ ] `plugins/ros-backend/` exists with `package.json`, `tsconfig.json`, `src/plugin.ts`, `src/router.ts` stubs
- [ ] Both packages are listed in root `package.json` workspaces
- [ ] `plugins/ros-backend/` uses `createBackendPlugin` from `@backstage/backend-plugin-api`
- [ ] Plugin is registered in `packages/backend/src/index.ts`
- [ ] `yarn tsc` passes with no errors
- [ ] `yarn pipeline` passes

---

### T2: Define Shared Types and Constants

Extract domain types, DTOs, and constants into `plugins/ros-common/`.

**Acceptance Criteria:**

- [ ] All RiSc domain types are defined: `RiSc`, `RiScVersion`, `Scenario`, `Action`, `RiScValuation`, `ThreatActor`, `Vulnerability`, status enums
- [ ] All wire-format DTOs are defined: API responses, GitHub DTOs, GCP DTOs, Slack DTO, migration change DTOs
- [ ] Constants exported: schema version list, branch prefix (`risc-draft/`), file naming pattern (`.ros_<id>.yaml`), supported versions
- [ ] Frontend `plugins/ros/` can import from `@kartverket/backstage-plugin-ros-common` and type-check successfully
- [ ] No runtime behavior change in the frontend

---

### T3: Implement SOPS Crypto Service

Port SOPS encryption/decryption via subprocess.

**Acceptance Criteria:**

- [ ] `encrypt(plaintext, sopsConfig)` spawns `sops encrypt`, returns encrypted YAML
- [ ] `decrypt(encryptedYaml)` spawns `sops decrypt`, returns plaintext JSON
- [ ] `extractSopsConfig(encryptedYaml)` parses key groups from YAML header
- [ ] Environment variables correctly injected: `GOOGLE_OAUTH_ACCESS_TOKEN`, `SOPS_AGE_KEY`
- [ ] GCP token format validated (base64)
- [ ] Age key format validated (bech32 prefix `AGE-SECRET-KEY-`)
- [ ] SOPS errors mapped to domain errors: `MISSING_DATA_KEY`, `NO_MATCHING_KEY`, `AUTHENTICATION_FAILED`
- [ ] Temp config files created and cleaned up reliably (including on error)
- [ ] Unit tests pass with mocked subprocess (≥11 tests ported from Kotlin)
- [ ] Integration test passes with real `sops` binary (encrypt → decrypt round-trip)

---

### T4: Implement GitHub Service

Port all GitHub operations using Octokit via Backstage credentials.

**Acceptance Criteria:**

- [ ] Dual-token pattern implemented: App installation token for reads, user token for writes
- [ ] Lists published RiSc files on default branch (pattern: `.ros_*.yaml`)
- [ ] Lists draft branches matching `risc-draft/<id>` prefix
- [ ] Lists open PRs from draft branches
- [ ] Fetches file content from any branch (with base64 decoding)
- [ ] Creates new branch from HEAD of default branch
- [ ] Creates/updates files on draft branches (with SHA for conflict detection)
- [ ] Creates pull requests (draft branch → default branch)
- [ ] Closes PRs and deletes branches (cleanup on delete)
- [ ] Fetches repository info including user permissions
- [ ] Fetches init RiSc template files from configured repo
- [ ] Returns appropriate errors for: 404 (not found), 409 (conflict), 403 (permission denied)
- [ ] Unit tests pass with mocked Octokit (≥36 tests ported from Kotlin)

---

### T5: Implement Schema Validation and Migration

Port JSON schema validation and the multi-version migration pipeline.

**Acceptance Criteria:**

- [ ] All 8 JSON schemas bundled (v3.2, v3.3, v4.0, v4.1, v4.2, v5.0, v5.1, v5.2)
- [ ] `validate(content)` validates against the correct schema version using `ajv`
- [ ] Supports both JSON and YAML input (YAML parsed before validation)
- [ ] Version auto-detected from content structure
- [ ] All 7 migration steps implemented: 3.2→3.3→4.0→4.1→4.2→5.0→5.1→5.2
- [ ] Each migration step correctly transforms the document structure (field renames, array restructures, default values)
- [ ] Migration change tracking produces `MigrationStatus` with per-version change manifests
- [ ] `migrate(content, fromVersion, toVersion)` applies only the needed steps
- [ ] All test fixtures from Kotlin (`3.2.json` through `5.0.json`) produce identical output when migrated
- [ ] Unit tests pass (≥13 migration tests + ≥14 validation tests ported)

---

### T6: Implement Comparison Service

Port the structured diff engine for RiSc content comparison.

**Acceptance Criteria:**

- [ ] Compares two RiSc objects and produces property-level change tracking
- [ ] Change types supported: `Added`, `Deleted`, `Changed`, `ContentChanged`, `Unchanged`
- [ ] Version-aware: correctly diffs 3.x, 4.x, and 5.x structures
- [ ] Scenarios matched by ID (not position) to handle reordering
- [ ] Produces serializable DTOs consumable by the frontend
- [ ] Unit tests pass (≥7 comparison tests ported from Kotlin)
- [ ] Output matches Kotlin backend output for identical inputs

---

### T7: Implement RiSc CRUD Service (Core Orchestrator)

Port the main business logic that coordinates all sub-services.

**Acceptance Criteria:**

- [ ] `fetchAllRiScs(owner, repo, version)`: parallel fetch of published + drafts + approvals → decrypt → migrate → validate → return unified list with statuses
- [ ] `createRiSc(owner, repo, content?, templateId?, sopsConfig)`: generate ID, optionally apply template, encrypt, create draft branch with file
- [ ] `updateRiSc(owner, repo, id, content, sopsConfig)`: validate schema, encrypt, push to draft branch, detect conflicts via SHA
- [ ] `deleteRiSc(owner, repo, id)`: status-dependent deletion (draft: delete branch; sent-for-approval: close PR + delete branch; published: push deletion commit)
- [ ] `publishRiSc(owner, repo, id)`: create PR from draft branch to default branch
- [ ] `fetchDifference(owner, repo, id)`: compare draft vs published, return structured diff
- [ ] Status state machine correctly implemented: `Published` ↔ `Draft` ↔ `SentForApproval`
- [ ] Concurrent fetches use `Promise.all` / `Promise.allSettled` (not sequential)
- [ ] Partial failures handled gracefully (one RiSc failing doesn't block others)
- [ ] All domain errors from sub-services propagated with correct `ProcessingStatus`
- [ ] Integration tests pass with mocked sub-services

---

### T8: Implement Supporting Integrations

Port GCP KMS, Init RiSc, and Slack services.

**Acceptance Criteria:**

**GCP KMS:**

- [ ] Validates GCP access token via Google tokeninfo endpoint
- [ ] Fetches project IDs from Cloud Resource Manager
- [ ] Filters projects by `-prod-` suffix (plus configurable allowed list)
- [ ] Checks IAM `cloudkms.cryptoKeys.list` permission per project (parallel)
- [ ] Lists KMS key rings and crypto keys for permitted projects
- [ ] Returns `GcpCryptoKeyObject[]` with project/keyring/key metadata

**Init RiSc:**

- [ ] Fetches descriptor config from configured template GitHub repo
- [ ] Returns list of available templates with names/descriptions
- [ ] Fetches individual template content
- [ ] Normalizes template: strips timestamps, sets action statuses to `NOT_OK`
- [ ] Validates template against current schema version

**Slack:**

- [ ] POSTs feedback message to configured webhook URL
- [ ] Returns success/failure status
- [ ] Webhook URL read from `app-config.yaml`

**Tests:**

- [ ] Unit tests for each service (≥12 tests total ported from Kotlin)

---

### T9: Implement Router and Error Handling

Wire all services into an Express router with auth middleware.

**Acceptance Criteria:**

- [ ] All endpoints exposed matching the Kotlin API surface:
  - `GET /:owner/:repo/:version/all`
  - `GET /:owner/:repo/:id`
  - `GET /:owner/:repo/:id/difference`
  - `POST /:owner/:repo`
  - `PUT /:owner/:repo/:id`
  - `DELETE /:owner/:repo/:id`
  - `POST /:owner/:repo/publish/:id`
  - `GET /google/gcpCryptoKeys`
  - `GET /initrisc`
  - `POST /slack/feedback`
- [ ] Backstage identity token validated on all requests (via `httpAuth`)
- [ ] `GCP-Access-Token` header extracted and passed to services
- [ ] Write operations (POST/PUT/DELETE) verify GitHub write permission before proceeding
- [ ] Domain errors mapped to correct HTTP status codes (401, 403, 409, 422, 500, 502)
- [ ] Error responses include `ProcessingStatus` field for frontend consumption
- [ ] Request/response logging via Backstage logger

---

### T10: Implement Feature Toggle and Frontend Integration

Enable config-driven switching between new and legacy backends.

**Acceptance Criteria:**

- [ ] `app-config.yaml` supports `ros.backend: 'native' | 'legacy'` (default: `'legacy'`)
- [ ] Frontend reads config via `configApi.getOptionalString('ros.backend')`
- [ ] When `'native'`: API calls route to `/api/ros/...` via Backstage service discovery
- [ ] When `'legacy'`: API calls route to `/api/proxy/risc-proxy/...` (existing behavior, unchanged)
- [ ] Toggle switch does not require frontend rebuild (config-only change)
- [ ] Both backends can be deployed simultaneously
- [ ] No behavioral difference observable by end users regardless of toggle position
- [ ] Documentation added to `app-config.example.yaml` explaining the toggle

---

### T11: End-to-End Validation

Validate the new backend produces identical behavior to the Kotlin backend.

**Acceptance Criteria:**

- [ ] Deploy both backends to staging GKE cluster
- [ ] Toggle to new backend and verify all user flows:
  - Create RiSc (blank and from template)
  - Edit scenario, save draft
  - Publish (PR created correctly)
  - Fetch shows correct status per RiSc
  - Delete in each state (draft, sent-for-approval, published)
  - Multi-version fetch triggers correct migrations
  - Encryption round-trip preserves content
  - GCP crypto key listing works
  - Slack feedback delivered
- [ ] Compare API responses between backends for same repository (field-by-field)
- [ ] No data corruption observed across 10+ encrypt/decrypt cycles
- [ ] Concurrent operations (2+ users editing different RiScs) succeed without conflict
- [ ] Performance: `fetchAllRiScs` completes within 2× of Kotlin backend time (accounting for subprocess overhead)
- [ ] Toggle back to legacy works instantly with no state corruption

---

### T12: Cleanup and Decommission

Remove toggle, finalize deployment, archive legacy.

**Acceptance Criteria:**

- [ ] Feature toggle removed (hardcoded to native backend)
- [ ] Proxy configuration for Kotlin backend removed from `app-config.yaml`
- [ ] Frontend URL construction simplified (legacy paths removed)
- [ ] Dockerfile updated for production (SOPS binary included, correct permissions)
- [ ] Kotlin backend repo archived with deprecation notice
- [ ] README updated with new architecture documentation
- [ ] CI/CD pipeline builds and deploys the unified Backstage app (no separate backend deploy)
