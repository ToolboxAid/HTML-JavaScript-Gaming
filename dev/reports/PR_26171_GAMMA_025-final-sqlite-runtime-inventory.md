# PR_26171_GAMMA_025-final-sqlite-runtime-inventory

TEAM ownership: Golf.

## Dependency Closeout

- PR #46 / `PR_26171_GAMMA_024-local-api-sqlite-reference-cleanup` was marked ready for review.
- PR #46 merge result: `6e03515e75a673e912b1bc44e7e08073a7cfe731`.
- Final `main` commit after PR #46 pull: `6e03515e75a673e912b1bc44e7e08073a7cfe731`.
- PR #46 head `a6cd320756e07d1b050034044654572661d1cd94` is an ancestor of `main`.

## Inventory Scope

Inventory was run from fresh `main` after PR #46 merged, before this PR's inventory report files were created.

Search command:

```text
rg -n -i "sqlite|node:sqlite|DatabaseSync|\.sqlite" --glob '!node_modules/**' --glob '!tmp/**' --glob '!.git/**' .
```

Verification commands:

```text
rg -n -i "node:sqlite|DatabaseSync|better-sqlite|sqlite3|createMessagesSqliteService|messages-sqlite-service|messages\.sqlite|GAMEFOUNDRY_MESSAGES_SQLITE_PATH" src
rg -n -i "sqlite|node:sqlite|DatabaseSync|\.sqlite" src/dev-runtime/server/local-api-router.mjs
```

## Inventory Summary

Remaining file count: 131.

Remaining line count: 356.

| Classification | Files | Lines | Result |
| --- | ---: | ---: | --- |
| Active Runtime | 0 | 0 | No active SQLite runtime implementation remains. |
| Local API | 0 | 0 | No SQLite references remain in `src/dev-runtime/server/local-api-router.mjs`. |
| Tests | 6 | 11 | Test cleanup candidates remain. |
| Docs | 1 | 7 | Current governance wording remains intentionally. |
| Archive/Reference | 121 | 320 | Historical report and PR docs only. |
| Allowed Technical Debt | 3 | 18 | Non-implementation references retained for guards and validation rules. |

## Completion Declaration

SQLite runtime migration complete.

Active Runtime count is 0 and Local API count is 0.

## Active Runtime SQLite References

None.

Strict source verification found no active implementation markers in `src`:

- `node:sqlite`
- `DatabaseSync`
- `better-sqlite`
- `sqlite3`
- `createMessagesSqliteService`
- `messages-sqlite-service`
- `messages.sqlite`
- `GAMEFOUNDRY_MESSAGES_SQLITE_PATH`

Remaining `src` references are classified as allowed technical debt because they do not import, open, write, read, or fall back to SQLite.

## Active Local API SQLite References

None.

`src/dev-runtime/server/local-api-router.mjs` has zero SQLite matches after PR #46.

## Remaining Tests Requiring Cleanup

- `tests/dev-runtime/DbSeedIntegrity.test.mjs`
  - Lines 148, 193 use temporary `.sqlite` file names for Local DB seed/reseed validation.
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
  - Line 56 uses a temporary `.sqlite` file name for Local DB login/session validation.
- `tests/playwright/tools/BrowserApiUrlConfig.spec.mjs`
  - Line 24 uses a temporary `.sqlite` file name for browser API URL config validation.
- `tests/playwright/tools/AdminDbViewer.spec.mjs`
  - Line 80 uses a temporary `.sqlite` file name for Admin DB Viewer Local DB validation.
- `tests/playwright/tools/GameJourneyTool.spec.mjs`
  - Line 245 uses a temporary `.sqlite` file name for a Game Journey test helper.
  - Lines 1458, 1459, 1469 verify the legacy SQLite data guard and should remain until the migration guard is retired.
- `tests/playwright/tools/AdminHealthOperationsPage.spec.mjs`
  - Lines 214 and 221 are negative assertions that Admin health page/runtime source does not expose `SQLite`; these do not require cleanup unless the assertion wording changes.

## Remaining Docs Requiring Cleanup

No current active docs require cleanup for this PR.

`docs_build/dev/PROJECT_INSTRUCTIONS.md` has 7 intentional SQLite governance lines documenting deprecation and preventing new SQLite persistence.

## Archive References

Archive/reference inventory contains 121 files and 320 lines.

These matches are historical records under:

- `docs_build/dev/reports/`
- `docs_build/pr/`

No matches were found under the `archive/` directory.

Historical references include prior PR reports, validation logs, and old BUILD/PLAN/APPLY docs that mention prior SQLite work. They are retained for traceability and are not active runtime ownership.

## Allowed Technical Debt

- `src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs`
  - Lines 63, 68, 71, 81, 84, 88, 172, 248, 316.
  - Purpose: legacy SQLite data-preservation guard. The Postgres metrics store fails visibly if an unmigrated legacy SQLite file exists. It does not import or open SQLite and does not fall back to SQLite.
- `src/dev-runtime/persistence/mock-db-store.js`
  - Line 26.
  - Purpose: legacy Local DB mode description string. It is not an implementation marker.
- `scripts/validate-browser-env-agnostic.mjs`
  - Lines 37, 38, 289, 298, 303, 309, 320, 389.
  - Purpose: validation rules that reject SQLite/provider/environment implementation details from browser/runtime surfaces.

## Skipped Lanes

- Playwright: skipped by request. This is an inventory/report-only PR.
- Samples: skipped by request. No sample files or runtime behavior changed.
- Runtime tests: skipped because this PR does not modify runtime code.
