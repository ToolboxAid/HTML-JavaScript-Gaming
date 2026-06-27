# PR_26164_090-remove-mem-db-dev

## Branch Validation

PASS: Current branch was verified as `main` before changes.

Command:

```text
git branch --show-current
main
```

## Scope

PASS: Changes are limited to DEV runtime database adapter cleanup, Admin DB Viewer/Login DEV UI needed for that cleanup, targeted tests, validation reports, and required PR report artifacts.

PASS: UAT and Prod database behavior were not changed. The shared adapter contract still lists UAT and Prod entries.

PASS: Supabase was not introduced.

## Pre-Change Adapter Finding

PASS: The current DEV runtime had two local adapter routes before this change:

- MEM DB route: `local-mem`, implemented by the in-memory mock adapter path.
- Local DB route: `local-db`, implemented by `LocalDbAdapter`.

PASS: The active DEV route before this cleanup was the MEM DB route by default in the local DEV data source setup. This PR changes the DEV default and only active runtime option to Local DB.

## Local DB Activation Evidence

PASS: DEV runtime now reports only `local-db` as the local mode and rejects the retired `local-mem` route.

Evidence from targeted runtime probe:

```json
{
  "activeMode": "local-db",
  "contractEnvironments": ["Local DB", "UAT", "Prod"],
  "modeIds": ["local-db"],
  "retiredModeOk": false,
  "retiredModeStatus": 500,
  "retiredModeError": "Unknown local login environment: local-mem."
}
```

PASS: No runtime fallback to MEM DB remains.

PASS: Missing Local DB configuration fails visibly with actionable diagnostics. The Admin DB Viewer coverage exercises `GAMEFOUNDRY_LOCAL_DB_DISABLE` and verifies a visible Local DB error state instead of a MEM DB fallback.

PASS: Browser-storage product-data ownership was not added. The DEV mock store disables browser localStorage-backed product persistence and relies on Local DB/server-backed state.

## Implementation Summary

PASS: `src/dev-runtime/persistence/mock-db-store.js` now exposes Local DB as the only local session mode and rejects unknown modes.

PASS: `src/dev-runtime/server/mock-api-router.mjs` removed the active MEM DB adapter route, MEM DB contract entry, MEM DB mode switch, and MEM DB fallback path. Local DEV runtime starts in Local DB and persists through `LocalDbAdapter`.

PASS: `admin/db-viewer.html`, `admin/db-viewer.js`, and `src/engine/api/mock-db-viewer-ui.js` now present Admin DB Viewer as Local DB-backed state only. Write controls that targeted old mock routes were removed from the viewer UI.

PASS: `login.html`, `assets/theme-v2/js/login-session.js`, `assets/theme-v2/js/gamefoundry-partials.js`, and `admin/environments.html` no longer expose Local Mem as a user-selectable DEV database option.

PASS: Playwright repo-server helper now provides an isolated test Local DB path when tests do not supply one, preserving per-test isolation without restoring MEM DB.

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Identify DEV adapters: MEM DB and Local DB | PASS | Pre-change audit found `local-mem` and `local-db`. |
| Confirm active DEV adapter before changes | PASS | Pre-change default route was MEM DB in the DEV data source setup. |
| Route DEV runtime to Local DB only | PASS | Runtime probe reports `activeMode: local-db` and `modeIds: ["local-db"]`. |
| Remove MEM DB as active runtime option | PASS | `local-mem` now returns `500` with an unknown environment diagnostic. |
| Remove MEM DB imports, switches, fallback paths where safe | PASS | Active `MockDbAdapter`, Local Mem contract entry, and Local Mem switch logic were removed. |
| Preserve shared DB adapter/service contracts | PASS | Shared service API shape remains; UAT/Prod contract entries remain. |
| Update Admin DB Viewer | PASS | Viewer opens Local DB-backed state and no longer exposes MEM DB write controls. |
| Missing Local DB config fails visibly | PASS | Admin DB Viewer targeted test verifies visible Local DB-disabled diagnostics. |
| No silent MEM DB fallback | PASS | Retired mode request is rejected. |
| No hidden defaults | PASS | Unknown local login environment now throws instead of coercing. |
| No browser-storage product-data ownership | PASS | Browser localStorage persistence path is disabled for product data. |
| Do not change UAT/PROD behavior | PASS | UAT/Prod contract entries remain untouched functionally. |
| Do not introduce Supabase | PASS | No Supabase references were added. |
| Playwright coverage for changed runtime JS | PASS/WARN | V8 report produced; browser-executed files are covered, Node-only runtime files are advisory WARN. |

## MEM DB Reference Audit

### REMOVED

| File | Reference | Result |
| --- | --- | --- |
| `src/dev-runtime/persistence/mock-db-store.js` | `local-mem` session mode and browser-storage product persistence route | REMOVED |
| `src/dev-runtime/server/mock-api-router.mjs` | `LOCAL_MEM_MODE_ID`, active `MockDbAdapter`, Local Mem contract entry, Local Mem mode switch/fallback | REMOVED |
| `admin/db-viewer.html` | Local Mem viewer copy and mock write controls | REMOVED |
| `admin/db-viewer.js` | Viewer startup accepting non-Local DB mode | REMOVED |
| `src/engine/api/mock-db-viewer-ui.js` | Local Mem mode labeling and clear/seed write UI | REMOVED |
| `src/engine/api/mock-db-api-client.js` | User-facing MEM DB clear/seed error labels | REMOVED |
| `login.html` | Local Mem login selector button and copy | REMOVED |
| `assets/theme-v2/js/login-session.js` | Local Mem selector copy/defaults and Local Mem reseed messaging | REMOVED |
| `assets/theme-v2/js/gamefoundry-partials.js` | `local-mem` fallback default | REMOVED |
| `admin/environments.html` | Memory DB admin environment row/selector copy | REMOVED |
| Playwright setup files | Active test setup using `{ mode: "local-mem" }` | REMOVED |

### LEFT IN PLACE

| File | Reference | Result | Reason |
| --- | --- | --- | --- |
| `docs_build/dev/PROJECT_INSTRUCTIONS.md:320` | Historical governance mention that DB Adapter may be MEM DB | LEFT IN PLACE | Project instructions are source policy, not active runtime behavior, and were not in cleanup scope. |
| `docs_build/dev/PROJECT_INSTRUCTIONS.md:350` | Historical Memory DB local session rule | LEFT IN PLACE | Project instructions are source policy, not active runtime behavior, and were not in cleanup scope. |
| `src/dev-runtime/persistence/mock-db-store.js:302-308` | `memoryDbTables`, `memoryDbCleared`, `memoryDbOwners` option names | LEFT IN PLACE | Shared in-process table handoff contract used by Local DB/server repository state. It is not an active MEM DB adapter route. |
| `src/dev-runtime/server/mock-api-router.mjs:915,983` | `memoryDbTables` shared option | LEFT IN PLACE | Shared table handoff for server/repository state; no Local Mem adapter or fallback remains. |
| `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js:604` | `memoryDbTables` explicit table option | LEFT IN PLACE | Repository-level table handoff contract, not active MEM DB route selection. |
| `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js:56-59,251,253` | `memoryDbTables` explicit table option | LEFT IN PLACE | Repository-level table handoff contract, not active MEM DB route selection. |
| `src/dev-runtime/persistence/tool-repositories/objects-mock-repository.js:113,135,137` | `memoryDbTables` explicit table option | LEFT IN PLACE | Repository-level table handoff contract, not active MEM DB route selection. |
| `src/dev-runtime/persistence/tool-repositories/tags-mock-repository.js:99` | `memoryDbTables` explicit table option | LEFT IN PLACE | Repository-level table handoff contract, not active MEM DB route selection. |
| `tests/playwright/tools/GameJourneyTool.spec.mjs:908` | `memoryDbTables` test fixture option | LEFT IN PLACE | Isolated test fixture for repository table handoff, not active DEV runtime selection. |
| `tests/dev-runtime/DbSeedIntegrity.test.mjs:131,156,163` | Retired Local Mem rejection test | LEFT IN PLACE | Negative coverage proving `local-mem` is rejected. |
| `tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs:60` | Assertion that Local Mem selector is absent | LEFT IN PLACE | Negative coverage proving UI option is removed. |
| `tests/playwright/tools/LoginSessionMode.spec.mjs:264` | Assertion that Local Mem selector is absent | LEFT IN PLACE | Negative coverage proving UI option is removed. |
| `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs:103` | Assertion that Local Mem selector is absent | LEFT IN PLACE | Negative coverage proving UI option is removed. |

### FOLLOW-UP REQUIRED

| Reference | Result | Reason |
| --- | --- | --- |
| Internal `memoryDbTables` naming | FOLLOW-UP REQUIRED | A future contract-cleanup PR can rename this shared in-process table handoff terminology. Renaming it here would broaden this PR beyond active DEV runtime adapter cleanup and risk unrelated repository contracts. |
| Project instruction Memory DB wording | FOLLOW-UP REQUIRED | If policy has changed globally, update `docs_build/dev/PROJECT_INSTRUCTIONS.md` in a dedicated governance/docs PR. |

## Validation Lane Report

| Validation | Result | Notes |
| --- | --- | --- |
| `git diff --check` | PASS | Whitespace check passed; Git emitted line-ending warnings only. |
| Targeted syntax checks | PASS | `node --check` passed for changed JS/MJS files. |
| Targeted Node tests | PASS | `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs tests/dev-runtime/DevRuntimeBoundary.test.mjs` passed 5/5. |
| Targeted Playwright | PASS | `AdminDbViewer`, `LoginSessionMode`, `StaticOnlyLoginApiRequired`, and `ApiStaticRouteRecovery` passed 16/16. |
| `npm run test:workspace-v2` | PASS | Required legacy command name passed. User-facing language remains Project Workspace. |
| Playwright V8 coverage | PASS/WARN | Coverage report produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`. Node-only runtime files are WARN because Playwright browser V8 coverage does not collect them. |
| Inline script/style/event handler audit | PASS | No new inline script, style, or event handler patterns found in changed HTML. |
| Full samples smoke | SKIP | Not run per user instruction. Testing lane report records samples lane SKIP. |

## Playwright V8 Coverage Evidence

Changed runtime JS coverage report:

```text
(0%) src/dev-runtime/persistence/mock-db-store.js - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only
(0%) src/dev-runtime/server/mock-api-router.mjs - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only
(67%) admin/db-viewer.js - executed lines 53/53; executed functions 4/6
(80%) src/engine/api/mock-db-api-client.js - executed lines 19/19; executed functions 4/5
(83%) assets/theme-v2/js/gamefoundry-partials.js - executed lines 650/650; executed functions 50/60
(90%) src/engine/api/mock-db-viewer-ui.js - executed lines 479/479; executed functions 82/91
(96%) assets/theme-v2/js/login-session.js - executed lines 357/357; executed functions 27/28
```

## Manual Validation Notes

PASS: Admin DB Viewer opens in Local DB mode and shows Local DB-backed status/table state.

PASS: Admin DB Viewer no longer exposes Local Mem mode or mock clear/seed write controls.

PASS: Missing Local DB configuration path produces visible, actionable Local DB diagnostics.

PASS: Login DEV UI exposes Local DB only; Local Mem selector is absent.

PASS: Retired `local-mem` API mode requests fail visibly with `Unknown local login environment: local-mem.`

PASS: UAT and Prod remain in the DB adapter environment contract.

PASS: Required reports generated:

- `docs_build/dev/reports/PR_26164_090-remove-mem-db-dev.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

PASS: Required repo-structured ZIP is written to `tmp/PR_26164_090-remove-mem-db-dev_delta.zip`.
