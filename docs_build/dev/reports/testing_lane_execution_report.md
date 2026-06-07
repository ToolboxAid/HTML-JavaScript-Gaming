# Testing Lane Execution Report

PR: PR_26157_013-users-roles-login-and-db-viewer-completion

## Impacted Lanes

- shared mock DB persistence and identity seed data
- Admin Mock DB Viewer filters, session selector, relationship diagnostics, and Clear/Seed behavior
- Theme V2 header login/account/admin navigation behavior
- Project Journey session-aware runtime/search/write behavior
- changed-file/static validation

## Commands Run

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

## Behavior Covered

- Guest is selectable only as unauthenticated session state and is not in shared DB user or user_role seed data.
- Header shows Login for Guest and displayName for real users.
- Account navigation is available for user/admin role sessions; Admin navigation is available only for Admin.
- forge-bot remains the system actor and is not selectable as a human session button.
- Admin Mock DB Viewer removes standalone Users/Roles filters while preserving the `user_roles` identity filter.
- The `user_roles` filter renders `users`, `user_roles`, and `roles` in that order.
- DB Viewer renders current live shared mock DB state, including Project Journey, Palette, and Asset records after tool actions and refresh.
- Empty Mock DB tables retain headers after Clear Mock DB, and Seed Mock DB restores records.
- Project Journey respects selected session user for All/My/status/search filters.
- Project Journey rejects Guest writes with visible diagnostics and keeps User 3 free of Project Journey-owned records.

## Skipped Lanes

- Full samples smoke: SKIP per request and because samples are out of scope.
- Broad Playwright suite: SKIP because the touched runtime surfaces are covered by targeted Admin DB Viewer and Project Journey lanes plus static validation.

## Notes

- Initial PR013 targeted run exposed one CSS/semantic gap: `.nav-item` display rules overrode the native `hidden` attribute. Added a reusable Theme V2 `[hidden]` rule in `assets/theme-v2/css/layout.css` and documented it in the completion report.
- Final combined targeted lane passed 15/15 after the fix.
