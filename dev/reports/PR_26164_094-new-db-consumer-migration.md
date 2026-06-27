# PR_26164_094-new-db-consumer-migration

## Branch Validation

- PASS: current branch verified as `main` before PR 094 changes.

## Change Summary

- Migrated the Game Workspace DEV DB consumer from identity-style `id`/`userId` fields to key-based records:
  - `users.key`
  - `games.ownerKey`
  - `game_members.userKey`
- Updated Game Workspace browser calls from `{ userId }` / `ownerUserId` to `{ userKey }` / `ownerKey`.
- Updated Game Design context lookups to query Game Workspace by `userKey`.
- Updated the Game Workspace members table heading from `User ID` to `User Key`.
- Left UAT/PROD behavior unchanged and did not add Supabase wiring, custom password tables, fake login, MEM DB routing, hidden Local DB defaults, or browser-storage product-data ownership.

## DB Consumer Migration Audit

| Area | Result | Evidence |
| --- | --- | --- |
| Game Workspace repository users | PASS | `SEED_USERS` now use `key`; `GAME_WORKSPACE_SCHEMA.users` now lists `key`. |
| Game Workspace game ownership | PASS | seeded and created games now use `ownerKey`. |
| Game Workspace members | PASS | seeded members, member lookup, role update, and schema now use `userKey`. |
| Game Workspace browser calls | PASS | `currentGameUserKey()`, `repository.listGames({ userKey })`, and `repository.createGame({ ownerKey })` are used. |
| Game Design consumer | PASS | Game Design context queries now call `listGames({ userKey })`. |
| Local DB identity tables | PASS | `docs_build/database/ddl/dev-app-identity-schema.sql` uses `users.key`, `roles.key`, `user_roles.userKey`, and `user_roles.roleKey`. |
| Shared audit fields | PASS | Admin DB Viewer targeted tests verify `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, and ownership links to `users.key`. |

## MEM DB Reintroduction Audit

- PASS: no MEM DB runtime route was introduced.
- PASS: no active `local-mem` runtime selector was introduced.
- PASS: remaining `local-mem` references are negative validation only:
  - `tests/dev-runtime/DbSeedIntegrity.test.mjs`
  - `tests/playwright/tools/LoginSessionMode.spec.mjs`
  - `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs`
  - `tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`
- PASS: `DbSeedIntegrity` confirms the retired `local-mem` mode is rejected.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` | PASS | Read before PR 094 execution. |
| Verify branch is `main` | PASS | `git branch --show-current` returned `main`. |
| Update DB consumers to Local DB key-based identity records | PASS | Game Workspace and Game Design consumers migrated to `userKey`/`ownerKey`; DDL identity schema already key-based. |
| Replace old MEM/local-mem/fake DB assumptions | PASS | No active `local-mem` route remains; retired mode is rejected by tests. |
| Use `users.key`, `roles.key`, `user_roles.userKey`, `user_roles.roleKey` | PASS | DDL and Admin DB Viewer relationship checks validate these links. |
| Shared records use `key`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy` | PASS | Admin DB Viewer diagnostics verify audit fields across current Local DB tables. |
| Ownership fields reference `users.key` | PASS | Admin DB Viewer relationship summary validates `*.createdBy -> users.key` and `*.updatedBy -> users.key`. |
| Do not add custom password tables | PASS | No auth/password DDL or runtime tables were added. |
| Do not introduce Supabase runtime wiring | PASS | No Supabase files or runtime wiring changed. |
| Do not change UAT/PROD behavior | PASS | Changes are DEV runtime/tool consumer only. |
| Missing Local DB config fails visibly | PASS | `AdminDbViewer.spec.mjs` validates the actionable `Local DB adapter not configured` diagnostic. |
| No silent fallback to MEM DB | PASS | `DbSeedIntegrity` rejects `local-mem`; Admin DB Viewer missing-config test shows visible failure. |
| No browser storage as product-data source of truth | PASS | Changed code continues through server/API/Local DB paths; no browser product-data storage was added. |
| Update Admin DB Viewer as needed | PASS | No code change needed; targeted tests prove it reads Local DB-backed state and key relationships. |

## Validation Lane Report

- PASS: `git diff --check`
  - Output included only Git line-ending warning for `toolbox/game-workspace/index.html`.
- PASS: targeted syntax checks:
  - `node --check src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js`
  - `node --check src/dev-runtime/persistence/tool-repositories/game-design-mock-repository.js`
  - `node --check toolbox/game-workspace/game-workspace.js`
  - `node --check admin/db-viewer.js`
  - `node --check src/engine/api/mock-db-viewer-ui.js`
  - `node --check src/engine/api/mock-db-api-client.js`
  - `node --check src/engine/api/session-api-client.js`
- PASS: `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` (`2 passed`)
- PASS: targeted Playwright affected lane:
  - `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs tests/playwright/tools/GameDesignMockRepository.spec.mjs -g "Admin DB Viewer|Local DB viewer|Palette and Asset raw Local DB|Local DB audit|Game Workspace creates|Game Workspace displays|Game Workspace progress|Game Design saves|Game Design authors" --reporter=list --workers=1`
  - Result: `12 passed`
- WARN: broader affected Playwright bundle produced `18 passed`, `1 failed` on stale unrelated Toolbox count expectation:
  - Expected `Tool Count: 11/39`, received `Tool Count: 12/40`.
  - The failed assertion is outside the DB identity migration behavior and was not changed by this PR.
- PASS: inline HTML restrictions for changed HTML:
  - `rg --pcre2 -n "<script(?![^>]*\\bsrc=)|<style\\b|\\son[a-z]+\\s*=" toolbox/game-workspace/index.html` returned no matches.
- PASS: Playwright V8 coverage report generated:
  - `docs_build/dev/reports/playwright_v8_coverage_report.txt`
  - `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
  - `toolbox/game-workspace/game-workspace.js`: `(79%)`
  - Server-side dev-runtime repository modules are WARN-only because browser V8 coverage cannot collect Node-side modules directly.

## Manual Validation Notes

- Admin DB Viewer opens in Local DB mode, renders read-only Local DB tables, and shows relationship/audit diagnostics.
- Missing Local DB config produces a visible actionable diagnostic instead of falling back.
- Game Workspace still creates, opens, deletes, filters, and edits member role after the key migration.
- Game Design still reads Game Workspace game contexts and creates capability demos after the key migration.
- Full samples smoke test was skipped because PR 094 is scoped to DEV runtime/Admin DB consumer migration, not samples.
