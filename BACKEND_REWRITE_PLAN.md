# Rewrite Kotlin Backend as Backstage Backend Plugin

## Problem Statement

The RiSc plugin currently relies on a separate Kotlin/Spring Boot backend deployed as an independent service on GKE. This creates infra overhead (separate CI/CD, monitoring, scaling) and onboarding friction (two languages, two repos). We want to consolidate into a single Backstage backend plugin in TypeScript, co-located in this monorepo.

## Key Decisions

| Decision | Choice |
|----------|--------|
| SOPS approach | Shell out to `sops` CLI from Node.js (binary baked into Docker image) |
| GitHub auth | User token for writes, App token for reads via Backstage `GithubCredentialsProvider` |
| GCP auth | User's OAuth token passed from frontend (unchanged pattern) |
| Dropped integrations | ROSA (dead code) |
| Kept integrations | Init-RiSc templates, Slack feedback, GCP KMS key listing |
| Schema support | All legacy versions (v3.2+), migration on fetch |
| Plugin architecture | New backend system (`createBackendPlugin`) |
| Package structure | `plugins/ros-backend/`, `plugins/ros-common/`, existing `plugins/ros/` |
| Transition | Feature-toggle: frontend can target new or old backend via config |
| Deployment | GKE, custom Docker image |

## Feature Toggle Strategy

The frontend will support a config-driven toggle to route API calls to either:
- **New:** Backstage backend plugin at `/api/ros/...` (via Backstage service discovery)
- **Old:** Kotlin backend at the existing external URL (via Backstage proxy or direct)

Implementation:
1. Add a config flag in `app-config.yaml`, e.g.:
   ```yaml
   ros:
     backend: 'native' # 'native' (new plugin) | 'legacy' (Kotlin backend)
   ```
2. The frontend's `useAuthenticatedFetch` (or a wrapper) reads this config and routes requests accordingly.
3. The old Kotlin backend remains deployed and functional until the toggle is permanently set to `native` and validated in production.
4. After confidence is established, remove the toggle and decommission the Kotlin backend.

## Package Structure

```
plugins/
├── ros/                  # Frontend plugin (existing)
├── ros-backend/          # New Backstage backend plugin
│   ├── src/
│   │   ├── plugin.ts             # createBackendPlugin entry
│   │   ├── router.ts             # Express router with all endpoints
│   │   ├── services/
│   │   │   ├── RiScService.ts        # Core CRUD + state machine
│   │   │   ├── GitHubService.ts      # Branch/PR lifecycle
│   │   │   ├── SopsCryptoService.ts  # Subprocess wrapper
│   │   │   ├── SchemaService.ts      # Validation + migration
│   │   │   ├── GcpKmsService.ts      # KMS key listing
│   │   │   ├── InitRiScService.ts    # Template fetching
│   │   │   └── SlackService.ts       # Feedback webhook
│   │   ├── lib/
│   │   │   ├── sops.ts              # SOPS CLI interaction
│   │   │   └── errors.ts            # Domain error types
│   │   └── __tests__/
│   └── package.json
└── ros-common/           # Shared types
    ├── src/
    │   ├── types.ts              # RiSc, Scenario, Action, etc.
    │   ├── dtos.ts               # Wire format types
    │   ├── constants.ts          # Schema versions, status enums, file conventions
    │   └── index.ts
    └── package.json
```

## Implementation Phases

### Phase 0: Preparation (in Kotlin repo)
- Audit existing test coverage in the Kotlin backend
- Add integration tests for under-tested areas (especially the GitHub PR state machine and SOPS encrypt/decrypt round-trips)
- Document all edge cases discovered during test writing
- These tests become the executable specification for the rewrite

### Phase 1: Scaffold packages
- Create `plugins/ros-common/` with shared types extracted from frontend `utils/types.ts` and `utils/DTOs.ts`
- Create `plugins/ros-backend/` with Backstage new backend system boilerplate
- Wire up in `packages/backend/` so the plugin is loaded
- Update `package.json` workspace config
- Verify `yarn tsc` and `yarn pipeline` pass

### Phase 2: SOPS crypto service
- Implement `SopsCryptoService` — spawn `sops` CLI subprocess
- Handle env vars: `SOPS_AGE_KEY`, `GOOGLE_OAUTH_ACCESS_TOKEN`
- Parse SOPS config from encrypted YAML (key groups, shamir threshold)
- Error mapping: `MISSING_DATA_KEY`, `NO_MATCHING_KEY`, `AUTHENTICATION_FAILED`
- Token validation (GCP b64 format, Age bech32 format)
- Unit tests with mocked subprocess, integration test with real `sops` binary

### Phase 3: GitHub service
- Implement `GitHubService` using Backstage `GithubCredentialsProvider` + Octokit
- Operations:
  - List files on default branch (published RiScs)
  - List files on draft branches
  - List open PRs (sent for approval)
  - Fetch file content from branch
  - Create/update files on draft branches
  - Create PRs (draft → main)
  - Delete branches
- Dual-token pattern: App token for reads, user token for writes
- Port all branch naming conventions (`risc-draft/<id>`)
- Unit tests with mocked Octokit

### Phase 4: Schema validation & migration
- Port JSON schema validation using `ajv` (schemas already in frontend repo)
- Implement version detection and migration pipeline (v3.2 → v3.3 → v4.0 → ... → v5.2)
- Port each migration step from Kotlin
- Unit tests per migration path

### Phase 5: RiSc CRUD service (core orchestrator)
- Implement `RiScService` — the main business logic:
  - `fetchAll`: parallel fetch published + drafts + approvals → decrypt → migrate → validate
  - `create`: generate ID, optional template, encrypt, push draft branch
  - `update`: validate, encrypt, push to draft, optionally create PR
  - `delete`: status checks, push deletion marker
  - `publish`: create approval PR
  - `diff`: compare draft vs published content
- Status state machine: Published → Draft → SentForApproval (+ deletion variants)
- Wire all sub-services together
- Integration tests against mocked GitHub + real SOPS

### Phase 6: Supporting integrations
- `GcpKmsService`: list projects, filter by "-prod-", list crypto keys per project
- `InitRiScService`: fetch templates from configured GitHub repo, clean timestamps
- `SlackService`: POST feedback to webhook URL
- Unit tests for each

### Phase 7: Router & auth
- Express router exposing all endpoints (matching Kotlin API surface)
- Backstage auth: validate Backstage identity token (built-in middleware)
- GCP token passthrough: extract from `GCP-Access-Token` header
- Write-permission check: verify GitHub write access before mutations
- Wire plugin into Backstage backend

### Phase 8: Feature toggle & frontend integration
- Add `ros.backend` config option to `app-config.yaml`
- Update frontend's API layer to read config and route to new or legacy backend
- Ensure both paths work simultaneously during transition
- Document toggle usage for operators

### Phase 9: End-to-end validation
- Deploy to dev/staging GKE cluster alongside Kotlin backend
- Toggle to new backend, run manual test scenarios:
  - Create RiSc (with and without template)
  - Edit and save draft
  - Publish (create PR)
  - Verify encryption round-trip
  - Delete RiSc
  - Multi-version fetch and migration
- Compare behavior against Kotlin backend for same repo
- Load test concurrent operations

### Phase 10: Cleanup & decommission
- Remove feature toggle (hardcode to native)
- Remove Kotlin proxy config from `app-config.yaml`
- Update documentation
- Archive/deprecate Kotlin backend repo
- Remove `sops` binary version pinning docs (or update for new container)

## AI Agent Strategy

**High-confidence AI tasks (minimal review needed):**
- Phase 1: Scaffolding (boilerplate)
- Phase 2: SOPS subprocess wrapper (mechanical)
- Phase 6: Supporting integrations (simple HTTP calls)
- Phase 7: Router setup (pattern-matching from Kotlin endpoints)

**Medium-confidence AI tasks (careful review needed):**
- Phase 3: GitHub service (well-defined Octokit API, but dual-token logic needs attention)
- Phase 4: Schema migration (each step is mechanical, but ordering/completeness matters)
- Phase 8: Feature toggle (straightforward but touches existing frontend code)

**Low-confidence AI tasks (intensive human review needed):**
- Phase 5: RiSc CRUD orchestrator (complex state machine, concurrency, edge cases)
- Phase 9: E2E validation (requires real infrastructure, human judgment)

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| State machine bugs in PR lifecycle | Port Kotlin tests first (Phase 0); feature toggle allows instant rollback |
| SOPS binary version mismatch | Pin `sops` version in Dockerfile, test encrypt/decrypt round-trip in CI |
| Schema migration data loss | Unit test every migration path with real v3.x/v4.x fixtures |
| Performance regression (subprocess overhead) | Benchmark SOPS calls; consider connection pooling for GitHub API |
| Feature toggle adds complexity | Keep toggle implementation minimal (config-driven URL switch); time-box removal |

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 0 (Kotlin tests) | 1 week |
| Phase 1 (scaffold) | 1-2 days |
| Phase 2 (crypto) | 2-3 days |
| Phase 3 (GitHub) | 3-5 days |
| Phase 4 (schemas) | 3-5 days |
| Phase 5 (CRUD) | 5-7 days |
| Phase 6 (integrations) | 1-2 days |
| Phase 7 (router/auth) | 2-3 days |
| Phase 8 (toggle) | 1-2 days |
| Phase 9 (E2E) | 3-5 days |
| Phase 10 (cleanup) | 1 day |
| **Total** | **~5-7 weeks** |

With AI agent doing 60-70% of implementation, human effort is roughly **2-3 weeks** of review, testing, and the hard orchestration logic.
