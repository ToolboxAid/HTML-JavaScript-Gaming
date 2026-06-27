# PR_26175_CHARLIE_002-system-health-dashboard

## Summary

Implemented the approved System Health dashboard increment for safe Local API startup diagnostics.

The dashboard now surfaces a server-owned Local API Startup Diagnostics table that reports:

- approved startup diagnostics format availability
- Environment Variables section masking/redaction behavior
- configured startup bind target
- configured site URL status
- configured or derived API URL
- configured API URL port
- configurable multiple runtime ports as `PENDING` and `deferred/cancelled`

The implementation preserves existing Postgres, R2, Runtime Environment, Limits, Diagnostics Plan, and Diagnostics Log behavior.

## Scope Controls

| Requirement | Result | Notes |
|---|---:|---|
| Active branch remains `PR_26172_CHARLIE_repository-compliance-stack` | PASS | Work stayed on the Charlie stack branch. |
| Implement only approved System Health dashboard scope | PASS | Changes are limited to Admin System Health dashboard/API status and targeted tests. |
| Preserve existing Postgres behavior | PASS | Existing database status rendering and server payload remain intact. |
| Preserve existing R2 behavior | PASS | Existing storage status and connectivity action behavior remain intact. |
| Preserve Runtime Environment behavior | PASS | Existing runtime environment masking/rendering remains intact. |
| Preserve Limits behavior | PASS | Existing limits/capacity rows and usage placeholders remain intact. |
| Preserve Diagnostics Plan and Diagnostics Log behavior | PASS | Existing tables remain; only Local API startup diagnostics table was added. |
| Use PASS/WARN/FAIL/PENDING correctly | PASS | Real known-good checks are `PASS`; missing configured site URL is `WARN`; deferred multiple runtime ports is `PENDING`. |
| Do not expose secrets | PASS | URL credentials are redacted, secret values are not returned, and tests assert no raw credentials appear. |
| Do not implement telemetry | PASS | No telemetry collection, storage, route, or metric implementation was added. |
| Do not implement configurable runtime ports | PASS | Multiple runtime ports are explicitly reported as `PENDING` / `deferred/cancelled`. |

## Files Changed

- `admin/system-health.html`
- `assets/theme-v2/js/admin-system-health.js`
- `src/dev-runtime/server/local-api-router.mjs`
- `tests/dev-runtime/AdminHealthOperations.test.mjs`
- `tests/playwright/tools/AdminHealthOperationsPage.spec.mjs`
- `docs_build/dev/reports/PR_26175_CHARLIE_002-system-health-dashboard.md`
- `docs_build/dev/reports/PR_26175_CHARLIE_002-system-health-dashboard-manual-validation-notes.md`
- `docs_build/dev/reports/PR_26175_CHARLIE_002-system-health-dashboard-instruction-compliance-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Notes

- Added `systemHealthLocalApiStartupDiagnostics()` in the Local API router so the browser receives structured, sanitized diagnostics instead of parsing startup console output.
- Added a `localApiStartup` payload to `/api/admin/system-health/status`.
- Added Local API Startup Diagnostics table markup to `admin/system-health.html`.
- Extended `assets/theme-v2/js/admin-system-health.js` to render startup diagnostic rows using the existing shared status helpers.
- Added API-level tests for local startup diagnostics rows, deferred runtime ports, and URL credential redaction.
- Added Playwright coverage for the new dashboard table and static markup.

## Validation Lane Report

| Command | Result |
|---|---:|
| `git diff --check` | PASS |
| `node --test tests/dev-runtime/LocalApiStartupLogging.test.mjs` | PASS, 2 tests |
| `node --test tests/dev-runtime/AdminHealthOperations.test.mjs` | PASS, 4 tests |
| `npx playwright test tests/playwright/tools/AdminHealthOperationsPage.spec.mjs` | PASS, 3 tests |

## Skipped Lanes

- Full samples smoke: skipped; the scope is Admin System Health dashboard diagnostics only.
- Broad Playwright suite: skipped; targeted System Health coverage passed.
- Telemetry validation: skipped; telemetry was explicitly out of scope and not implemented.
- Configurable runtime port validation: skipped; configurable multiple runtime ports were explicitly deferred/cancelled and not implemented.

## Dependency Notes

The current branch already contains the approved Local API startup diagnostics formatter shape:

- deterministic `Environment Variables` section
- deterministic `All Runtime Ports being used by Service` section
- secret-like value masking
- URL credential redaction

Validation confirmed the startup formatter remains intact through `tests/dev-runtime/LocalApiStartupLogging.test.mjs`.

## ZIP Artifact

Repo-structured delta ZIP:

- `tmp/PR_26175_CHARLIE_002-system-health-dashboard_delta.zip`
