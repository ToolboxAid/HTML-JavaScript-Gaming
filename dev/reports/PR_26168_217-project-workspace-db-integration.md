# PR_26168_217-project-workspace-db-integration

## Branch Validation

PASS - current branch was verified as `main` before edits.

## Scope Summary

- Added a read-only Local API project-record contract at `/api/project-workspace/projects`.
- Rendered Project Workspace Local DB/SQLite project records in the workspace UI.
- Removed browser-triggered Project Workspace seed/reset behavior.
- Blocked guest save controls while preserving guest browsing and open-project review.
- Kept Project Workspace saves in the Local API/Local DB lane instead of the broader configured database persistence path.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Begin Project Workspace Local API + Local DB integration for project records | PASS | `/api/project-workspace/projects` returns Local API, Local DB, SQLite, record count, and project records. |
| Project Workspace must not own project product data in browser/page-local arrays | PASS | Browser reads project records through `readProjectWorkspaceProjectRecords()` and renders server-returned records; no page-local product data arrays were added. |
| Web UI must flow through API/service contract | PASS | UI uses `Web UI -> Local API/Service Contract -> Local DB` project record status. |
| API/server owns authoritative project keys | PASS | Server returns `projectKey` values and `apiOwnsAuthoritativeProjectKeys: true`; browser does not create project keys. |
| Preserve guest browsing | PASS | Guest can view and open projects in targeted Playwright coverage. |
| Guest saving must not be allowed | PASS | Guest Create/Delete/update controls are disabled; server save methods require Local API session state. |
| Do not introduce browser storage as product-data SSoT | PASS | Static search found no `localStorage`, `sessionStorage`, or `indexedDB` in changed Project Workspace files. |
| Do not add Supabase Auth/Postgres behavior | PASS | Project Workspace save persistence was moved to Local API/Local DB contract metadata; no new Supabase/Postgres behavior was added for this PR. |
| Use Local API, Local DB, SQLite terminology for DEV | PASS | UI and API status surface Local API, Local DB, and SQLite. |
| Keep PR independently scoped, reportable, and testable | PASS | Changes are limited to Project Workspace UI/client, Local API project-record status, root Toolbox read behavior, and targeted tests. |

## Validation Lane Report

- PASS - `node --check .\toolbox\game-workspace\game-workspace.js`
- PASS - `node --check .\toolbox\game-workspace\game-workspace-api-client.js`
- PASS - `node --check .\toolbox\tools-page-accordions.js`
- PASS - `node --check .\src\dev-runtime\server\local-api-router.mjs`
- PASS - `node --check .\tests\playwright\tools\GameWorkspaceMockRepository.spec.mjs`
- PASS - static inline guard for `toolbox/game-workspace/index.html`
- PASS - static browser storage/product-data/Supabase/Postgres search across changed Project Workspace files
- PASS - targeted Playwright: `npx playwright test tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs -g "Game Workspace creates|Project Workspace preserves guest|active-game API diagnostics|malformed active-game|displays and edits|progress panels update"` (6 passed)
- PASS - direct Local API contract check for `/api/project-workspace/projects`: returned `Local API`, `Local DB`, `SQLite`, `apiOwnsAuthoritativeProjectKeys: true`, `browserProductDataSsoT: false`, `guestBrowsingAllowed: true`, `guestSavingAllowed: false`, `recordCount: 4`
- FAIL - `npm run test:workspace-v2` was run twice. This is a legacy command name; the user-facing language is Project Workspace. After removing the Project Workspace reset failure, the command still fails in `RootToolsFutureState.spec.mjs` on broader configured-database writes from Game Design `validateDesign` and Controls `replaceMappings`, plus one Game Design page error caused by that configured-database failure.

## Playwright V8 Coverage

PASS - targeted Playwright runs updated `docs_build/dev/reports/playwright_v8_coverage_report.txt` for changed runtime JavaScript coverage reporting.

## Manual Validation Notes

- Confirmed Project Workspace project records render from the Local API contract with server-owned authoritative keys.
- Confirmed guest users can browse/open projects but cannot create, delete, or edit project records.
- Confirmed signed-in test coverage can create, open, edit, and delete through the Local API/service contract.
- Confirmed no browser storage SSoT or page-local product data arrays were introduced.

## Full Samples Run/Skip Decision

SKIP - full samples smoke was not run. This PR changes Project Workspace Local API/UI behavior and targeted Project Workspace plus legacy workspace-contract validation were run; sample runtime surfaces were not directly impacted.
