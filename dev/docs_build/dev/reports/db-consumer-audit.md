# PR_26164_096 DB Consumer Audit

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.
- Scope: audit/reporting only.
- Runtime behavior changed: No.
- Supabase introduced: No.
- MEM DB reintroduced: No.
- Fake login removed: No.

## Audit Method

Active repo areas were searched for DB, data, auth, API, browser-storage, SQL, and route consumers. Deprecated `archive/v1-v2`, `start_of_day`, generated `tmp`, `node_modules`, test result output, and prior PR reports were excluded unless active code imported them.

The CSV at `docs_build/dev/reports/db-consumer-audit.csv` is the row-level inventory. Static HTML pages without forms, API calls, persistence calls, auth links, or product-data ownership were not classified as DB/data/auth consumers.

## Summary

- PASS: PR094 did not migrate all active DB consumers. Current state shows Game Workspace and Game Design are on the Local DB route, but active Assets, Controls, Objects, Palette/Colors, Tags, Game Journey, admin/account placeholders, public showcase pages, engine persistence utilities, legacy-named Local DB clients, and test consumers remain in the audit as OK Local DB, Needs review, or Needs migration depending on current source.
- PASS: No active MEM DB runtime route was found.
- PASS: No active `/login.html` reference was found.
- PASS: No active fake-login reference was found.
- WARN: Legacy `mock-db` names remain on Local DB-backed clients, routes, store helpers, repositories, and tests. The audit treats these as naming/contract review items, not active MEM DB behavior.
- WARN: Dynamic SQLite schema creation remains in `src/dev-runtime/server/mock-api-router.mjs`. No `.sql` DDL artifact was found outside `docs_build/database/ddl/`, but runtime DDL-like code should be reviewed against the documented DDL contract.
- WARN: Browser-storage product-data ownership was not confirmed as the active app source of truth, but engine persistence utilities and dormant browser-storage scaffolding in `mock-db-store.js` need boundary review before production ownership decisions.

## Consumer Status Counts

- OK Local DB: 41
- Needs migration: 17
- Needs review: 33
- Out of scope: 13

## Required Findings

### PR094 Migration Scope

PASS: The audit confirms PR094 was not a repo-wide DB consumer migration. It appears to have moved the Game Workspace/Game Design path to the key-based Local DB route, while other active consumers still require migration or review. Remaining examples include:

- `toolbox/assets/assets.js`
- `toolbox/controls/controls.js`
- `toolbox/objects/objects.js`
- `toolbox/colors/colors.js`
- `toolbox/tags/tags.js`
- `toolbox/game-journey/game-journey.js`
- `admin/users.html`
- `admin/roles.html`
- `account/index.html`
- `marketplace/index.html`
- `src/engine/persistence/StorageService.js`
- `src/dev-runtime/server/mock-api-router.mjs`

### MEM DB References

PASS: No active runtime MEM DB route or import was found.

References found:

- `docs_build/dev/PROJECT_INSTRUCTIONS.md` contains governance text listing MEM DB as a historical/allowed adapter category in a general rule. This is not runtime code.

### local-mem References

PASS with documentation: Remaining `local-mem` references are active tests asserting the retired mode is absent or rejected.

- `tests/dev-runtime/DbSeedIntegrity.test.mjs`
- `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs`
- `tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`

Migration status: Out of scope for this audit PR. Recommended follow-up only if the test wording is renamed after the runtime route naming cleanup.

### fake-login References

PASS: No active fake-login or "fake login" references were found in active account, admin, asset, src, toolbox, or tests areas searched.

### /login.html References

PASS: No active `/login.html` or `login.html` references were found in the active searched areas.

### Browser-Storage Product-Data Ownership

PASS with WARN: No confirmed active browser-storage product-data source of truth was found for the Local DB-backed DEV route. The following active files still need boundary review because they can read or write browser storage or retain disabled browser-storage scaffolding:

- `src/engine/persistence/BrowserStorageService.js`
- `src/engine/persistence/StorageService.js`
- `src/engine/persistence/LocalStorageService.js`
- `src/engine/persistence/SessionStorageService.js`
- `src/engine/persistence/CookieStorageService.js`
- `src/engine/persistence/SaveSlotManager.js`
- `src/engine/release/SettingsSystem.js`
- `src/engine/release/CrashRecoveryManager.js`
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/tools/common/WorkspaceDirtyNotifier.js` is classified Out of scope because it uses `sessionStorage` for transient workspace coordination, not product-data ownership.

### Page-Local Product-Data Arrays

WARN: Active static/page-local ownership remains and needs targeted migration or review. High-signal examples:

- `toolbox/toolRegistry.js`
- `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- `src/dev-runtime/guest-seeds/tool-state-samples.js`
- `src/dev-runtime/guest-seeds/palette-source-mock-db.js`
- `src/dev-runtime/persistence/tool-repositories/palette-catalog-config.js`
- `toolbox/objects/objects.js`
- `toolbox/colors/colors.js`
- `admin/users.html`
- `admin/roles.html`
- `admin/site-settings.html`
- `account/index.html`
- `account/profile.html`
- `index.html`
- `games/index.html`
- `marketplace/index.html`

### DDL Location Audit

PASS: DDL artifact found under the approved location:

- `docs_build/database/ddl/dev-app-identity-schema.sql`

PASS: No `.sql` DDL artifact was found under `src/` or `docs/`.

WARN: Runtime DDL-like SQLite table creation exists in:

- `src/dev-runtime/server/mock-api-router.mjs`

This is not a misplaced DDL artifact, but it should be reviewed in a follow-up so runtime Local DB schema creation stays aligned with `docs_build/database/ddl/`.

### DML/Setup Artifact Location Audit

PASS: Temporary setup/review DML artifact found under the approved location:

- `docs_build/database/dml/dev-app-identity-temporary-setup-review.sql`

PASS: No setup `.sql` DML artifact was found outside `docs_build/database/dml/`.

WARN: Runtime DML exists in active router/repository code because active tools read/write Local DB state. This is expected runtime behavior, not a misplaced setup artifact.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified current branch is `main` before changes.
- PASS: Scope kept to audit/reporting only.
- PASS: Did not migrate DB consumers.
- PASS: Did not change runtime behavior.
- PASS: Did not introduce Supabase.
- PASS: Did not reintroduce MEM DB.
- PASS: Did not remove fake login.
- PASS: Searched active repo areas for DB/data/auth consumers.
- PASS: Excluded deprecated `archive/v1-v2` and `start_of_day` areas unless active imports required them.
- PASS: Produced row-level consumer audit with file path, owning area, consumer type, current data source, migration status, risk, and recommended next PR.
- PASS: Confirmed PR094 did not migrate all active DB consumers.
- PASS: Listed remaining MEM DB, local-mem, fake-login, and `/login.html` findings.
- PASS: Listed browser-storage product-data ownership findings.
- PASS: Listed page-local product-data findings.
- PASS: Listed DDL and DML/setup location findings.
- PASS: Playwright impacted: No. Audit/report-only PR.

## Validation Lane Report

- Impacted lane: reporting/audit only.
- Playwright impacted: No.
- Runtime JavaScript changed: No.
- Samples smoke test: SKIP. Audit/report-only PR; no samples or runtime behavior changed.

## Manual Validation Notes

- `git diff --check`: PASS.
- Audit report exists: PASS.
- Audit CSV exists: PASS.
- Runtime files modified: PASS, none modified.
- MEM DB reintroduced: PASS, no runtime file changes and no active MEM DB runtime route found.
- `/login.html` references: PASS, no active references found.
- DDL artifacts under `docs_build/database/ddl/`: PASS.
- DML/setup artifacts under `docs_build/database/dml/`: PASS.

## Required Outputs

- PASS: `docs_build/dev/reports/db-consumer-audit.md`
- PASS: `docs_build/dev/reports/db-consumer-audit.csv`
- PASS: `docs_build/dev/reports/codex_review.diff`
- PASS: `docs_build/dev/reports/codex_changed_files.txt`
- PASS: repo-structured ZIP under `tmp/PR_26164_096-db-consumer-audit_delta.zip`
