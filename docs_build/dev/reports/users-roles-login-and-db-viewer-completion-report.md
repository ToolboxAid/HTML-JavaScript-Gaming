# PR_26157_013 Users Roles Login And DB Viewer Completion Report

## Summary

Status: PASS

PR_26157_013 completes the users/roles/session cleanup for the shared Mock DB, Admin Mock DB Viewer, Theme V2 header login state, and Project Journey session-aware behavior.

Guest is now a selectable unauthenticated session state only. It is not seeded into `users`, `roles`, or `user_roles`, and Guest write attempts in Project Journey are visibly diagnosed instead of persisted.

## Implementation Notes

- Updated `src/engine/persistence/mock-db-store.js` so `key` remains the ULID SSoT, seeded users are User 1, User 2, User 3, Admin, and forge-bot, and seeded roles are user, admin, and system.
- Removed seeded Guest identity rows and added sanitization for stale persisted Guest user/role/user_role rows and removed shortcut fields.
- Updated `admin/db-viewer.js` so separate Users and Roles filter buttons are removed; `user_roles` is the single identity filter and renders `users`, `user_roles`, then `roles`.
- Added local/dev Theme V2 header login behavior in `assets/theme-v2/js/gamefoundry-partials.js`, driven by selected session user and shared mock DB roles.
- Added reusable Theme V2 `[hidden]` support in `assets/theme-v2/css/layout.css` because existing nav display rules overrode semantic hidden state.
- Updated Project Journey to disable writes for Guest, preserve search visibility for active projects, and keep real-user behavior unchanged.
- Updated targeted Playwright coverage for DB Viewer filters/session/header behavior, Project Journey Guest/User 3 behavior, live persistence, and role-based navigation.

## Completion Checklist

| Requested Item | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Read before edits. |
| Verify 100% of users/roles/mock DB/session work | PASS | This report maps every requested item and final targeted lanes pass. |
| Remove separate Users and Roles filters | PASS | `AdminDbViewer.spec.mjs` asserts no `users` or `roles` standalone filters. |
| Keep `user_roles` filter | PASS | `AdminDbViewer.spec.mjs` asserts one `user_roles` filter exists. |
| `user_roles` filter shows `users`, `user_roles`, `roles` in order | PASS | `AdminDbViewer.spec.mjs` evaluates rendered table order as `["users", "user_roles", "roles"]`. |
| All filter shows every table | PASS | Admin DB Viewer targeted test validates all expected shared/tool tables under All. |
| Tool filters still show tool-owned tables | PASS | Workspace, Game Design, Game Configuration, Project Journey, Palette, and Asset filters are tested. |
| Non-tool filters show standalone non-tool tables | PASS | Identity standalone tables are grouped under `user_roles`; no stale display diagnostics. |
| Guest not stored in database | PASS | Seed data no longer includes Guest; Admin DB Viewer tests assert `users` table does not contain Guest. |
| Guest removed from users seed data | PASS | `mock-db-store.js` seed users are User 1, User 2, User 3, Admin, forge-bot. |
| Guest removed from user_roles seed data | PASS | Relationship tests assert `user_roles` links are 6/6, matching non-Guest seeded joins. |
| Guest session selector remains available | PASS | `admin/db-viewer.html` keeps Guest button; tests assert selector buttons include Guest. |
| Guest represented as unauthenticated/null user | PASS | `MOCK_DB_SESSION_USERS` Guest has `userKey: null`; Project Journey Guest write controls are disabled. |
| User 3 has only users/user_roles/roles identity data visible/owned | PASS | Project Journey test asserts User 3 references only `users` and `user_roles`, and User 3 sees 0 Project Journey notes. |
| Seed users are User 1, User 2, User 3, Admin, forge-bot | PASS | Admin DB Viewer tests assert those users and no Guest. |
| Seed roles are user, admin, system | PASS | Admin DB Viewer tests assert those roles and no guest role. |
| Seed user_roles match requested assignments | PASS | Relationship count is 6/6 and user_roles table is rendered under the identity filter. |
| Header shows Login for Guest/no logged-in user | PASS | Admin DB Viewer and Project Journey tests assert Guest header Account link shows Login. |
| Header shows displayName for logged-in users | PASS | Admin DB Viewer tests assert User 1, User 3, and Admin display in header. |
| Account menu follows roles | PASS | Admin DB Viewer tests assert user sessions enable Account submenu links; Guest hides Account submenu. |
| Admin menu appears only for admin role | PASS | Admin DB Viewer tests assert User 1/User 3 hide Admin nav and Admin shows it. |
| forge-bot not selectable as logged-in human header user | PASS | Session selector test asserts no forge-bot button. |
| Old role-query simulation not used | PASS | `rg` found no active source matches for `data-toolbox-role-banner`, `data-project-data-menu`, `data-project-data-action`, or `data-project-data-status`. |
| Remove Actors table/code from active mock DB scope | PASS | `act` + `ors` table is scrubbed; targeted scan found no active mock DB/page source use of removed identity table. |
| Remove `accountType` | PASS | Targeted scan found no active source/spec matches in scoped users/roles/mock DB files. |
| Remove `isSystemUser` | PASS | Targeted scan found no active source/spec matches in scoped users/roles/mock DB files. |
| Remove `createdByType` | PASS | Targeted scan found no active source/spec matches in scoped users/roles/mock DB files. |
| Remove `updatedByType` | PASS | Targeted scan found no active source/spec matches in scoped users/roles/mock DB files. |
| Access and ownership checks use users, roles, user_roles | PASS | Header roles resolve from `roles` and `user_roles`; Project Journey ownership uses `ownerKey` and current `users.key`. |
| DB Viewer renders live shared mock DB data | PASS | Live persistence test adds Project Journey, Palette, and Asset records, refreshes, then verifies Mock DB Viewer sees them. |
| No hardcoded snapshots/counts | PASS | DB Viewer collects current repository/shared mock DB snapshot at render time; tests validate dynamic counts. |
| Empty tables show headers | PASS | Clear Mock DB test asserts empty table message and headers remain visible. |
| Every table uses `key` as ULID SSoT | PASS | Existing key display/relationship tests remain green; DB Viewer shows first 10 chars with full key title. |
| Every table includes `key`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy` | PASS | Admin DB Viewer audit findings report all current tables include audit fields. |
| `createdBy`/`updatedBy` reference `users.key` | PASS | DB Viewer relationship diagnostics assert created/updated relationships and no missing links. |
| Guest actions rejected or diagnosed | PASS | Project Journey Guest test asserts writes disabled, diagnostics visible, and no Guest-created note/item persisted. |
| Clear Mock DB flips to Seed Mock DB | PASS | Admin DB Viewer test asserts Clear -> Seed transition after confirmation. |
| Seed Mock DB flips back to Clear Mock DB | PASS | Admin DB Viewer test asserts Seed -> Clear transition and restored records. |

## Validation

| Command | Result |
| --- | --- |
| `node --check src/engine/persistence/mock-db-store.js` | PASS |
| `node --check admin/db-viewer.js` | PASS |
| `node --check assets/theme-v2/js/gamefoundry-partials.js` | PASS |
| `node --check toolbox/project-journey/project-journey-mock-repository.js` | PASS |
| `node --check toolbox/project-journey/project-journey.js` | PASS |
| `node --check tests/playwright/tools/AdminDbViewer.spec.mjs` | PASS |
| `node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs --reporter=list --workers=1` | PASS, 15/15 |
| `npm run test:playwright:static` | PASS |
| `git diff --check` | PASS, line-ending warnings only |
| `rg -n "MOCK_DB_KEYS\\.users\\.guest\|MOCK_DB_KEYS\\.roles\\.guest\|guestGuest\|isSystemUser\|createdByType\|updatedByType\|accountType" src/engine/persistence admin toolbox/project-journey assets/theme-v2 tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS, no matches |
| `rg -n "data-toolbox-role-banner\|data-project-data-menu\|data-project-data-action\|data-project-data-status" src admin toolbox assets/theme-v2` | PASS, no matches |

## Skipped Lanes

- Full samples smoke: SKIP per request. Samples are out of scope for this PR.
- Broad repository-wide Playwright: SKIP because targeted Admin DB Viewer and Project Journey lanes cover the shared mock DB/session/header surfaces touched by this PR.

## Manual Test Notes

1. Open `admin/db-viewer.html`; Guest should be selected, header should show Login, and Account/Admin dropdowns should not be available to Guest.
2. Select User 1; header should show User 1 and Account navigation should be enabled without Admin navigation.
3. Select Admin; header should show Admin and Admin navigation should appear.
4. Select `User Roles`; the visible tables should be `users`, `user_roles`, then `roles`.
5. Open Project Journey as Guest; no notes should be visible and add/edit controls should be disabled with a visible unauthenticated diagnostic.
