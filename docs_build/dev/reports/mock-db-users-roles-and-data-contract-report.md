# PR_26157_012 Mock DB Users, Roles, And Data Contract Report

## Summary

Implemented the Users Only mock DB contract. The shared mock DB adapter now owns users, roles, user_roles, tool table schemas, clear/seed behavior, and users.key audit references. Admin Mock DB and Project Journey now consume the shared session user and users/roles model.

## Implementation

- Added Guest, User 1, User 2, User 3, Admin, and forge-bot users.
- Added roles: guest, user, admin, system.
- Added user_roles joins for Guest, User 1, User 2, User 3, Admin, and forge-bot.
- Removed the old identity table from active Mock DB rendering and relationship diagnostics.
- Removed type-based audit ownership from Project Journey and the shared mock DB adapter.
- Updated Project Journey system ownership to resolve from forge-bot's users.key.
- Added shared table schemas and tool group ownership for Workspace, Game Design, Game Configuration, Project Journey, Palette, Asset, and Users/Roles.
- Added Mock DB Clear/Seed toggle behavior.
- Added Guest session user selection and Guest Project Journey coverage.
- Added a shared Mock DB adapter contract section to docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Completion Checklist

| Requirement | Status | Evidence |
|---|---:|---|
| Actors removed | PASS | Active touched source/test scan returned no matches for the removed table/model terms. |
| users table exists | PASS | Admin DB Viewer test verifies users table and user records. |
| roles table exists | PASS | Admin DB Viewer test verifies roles table and seeded role names. |
| user_roles table exists | PASS | Admin DB Viewer test verifies user_roles table and relationship diagnostics. |
| Guest/User 1/User 2/User 3/Admin/forge-bot exist | PASS | Admin DB Viewer test verifies all seeded users. |
| createdByType/updatedByType absent from active code/data | PASS | Active source/test grep returned no matches. |
| accountType removed | PASS | Active source/test grep returned no matches. |
| Every table uses key/createdAt/updatedAt/createdBy/updatedBy | PASS | Adapter schemas and DB Viewer diagnostics verify audit fields. |
| createdBy/updatedBy reference users.key | PASS | Relationship diagnostics verify audit links to users.key. |
| All current tool tables visible in Mock DB | PASS | Admin DB Viewer test covers Workspace, Game Design, Game Configuration, Project Journey, Palette, Asset, Users/Roles. |
| Empty tables show headers | PASS | Admin DB Viewer test verifies Workspace/current empty tables and post-clear schemas. |
| Clear Mock DB flips to Seed Mock DB | PASS | Admin DB Viewer test verifies button text after confirmed clear. |
| Seed Mock DB flips to Clear Mock DB | PASS | Admin DB Viewer test verifies reseed and button text. |
| DB Viewer renders live shared mock DB data | PASS | DB Viewer live persistence test adds Project Journey, Palette, and Asset records and verifies them after refresh. |
| Project Journey uses selected session user | PASS | Project Journey session tests verify User 2 and Guest behavior. |
| Guest access can be tested | PASS | Guest test creates a Guest-owned note/item and verifies My Notes/search. |
| Project Journey search respects selected session visibility | PASS | Search tests verify User 1/User 2/Guest scoped visibility and filter restoration. |
| System guidance title/details render on one line where possible | PASS | Project Journey UI test verifies guidance block width/wrap behavior. |
| Tool HR color preserved | PASS | Project Journey UI test verifies divider color matches the tool group column color and remains 1px. |
| Old role/project-data simulation hooks removed from active source | PASS | Active source grep returned no data-toolbox-role-banner/data-project-data-* matches. |

## Validation

| Lane | Command | Result |
|---|---|---:|
| Admin DB Viewer/session/roles | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --reporter=list --workers=1` | PASS, 2/2 |
| Project Journey runtime/search/session/HR | Included in combined targeted command | PASS, 13/13 |
| Combined targeted runtime/UI | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs --reporter=list --workers=1` | PASS, 15/15 |
| Changed-file/static | `npm run test:playwright:static` | PASS |
| JS syntax | `node --check` on changed JS/spec files | PASS |
| Whitespace | `git diff --check` | PASS, line-ending warnings only |
| Removed field scan | `rg -n "createdByType|updatedByType|accountType" ...` | PASS, no matches |
| Removed identity scan | `rg -n "\bactors\b|\bActors\b|..." ...` | PASS, no matches |
| Old simulation hook scan | `rg -n "data-toolbox-role-banner|data-project-data-menu|data-project-data-action|data-project-data-status" admin toolbox src assets` | PASS, no matches |

## Skipped

- Full samples smoke was not run per request.
- Full Playwright suite was not run; this PR touched shared DB behavior plus Admin DB Viewer and Project Journey, so targeted DB Viewer, Project Journey, static, and guard scans were run instead.
