# PR_26160_081 Navigation DB Contract Audit

Generated: 2026-06-09

## Branch Validation

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current branch | `main` | `main` | PASS |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Audit navigation/header route ownership in `assets/theme-v2/js/gamefoundry-partials.js` | PASS | `routeMap`, `adminMainItems`, and `localAdminMyStuffItems` classified below. |
| Focus on `routeMap`, `adminMainItems`, `localAdminMyStuffItems` | PASS | Findings table covers all three. |
| Report entries as product data, navigation config, or static shell behavior | PASS | Ownership table below. |
| Move only safe Admin/Toolbox navigation metadata behind API/service contract | PASS | Admin menu item lists moved to `/api/navigation/admin-menu`; broad `routeMap` left as static shell behavior. |
| Do not migrate Colors catalog, Project Journey suggestions, or creator-user | PASS | Those files were not modified. |
| No inline script/style/event handlers | PASS | Changes are external JS only. |

## Navigation Ownership Audit

| Item | Classification | Decision | Reason |
| --- | --- | --- | --- |
| `routeMap` | Static shell behavior with mixed route aliases | KEPT in browser shell | It drives partial link rewriting, active-link detection, login redirect links, and root-relative path resolution across the full site. Moving the whole map would affect public navigation, account/admin protection, and every `data-route` partial link. |
| Admin/Toolbox entries inside `routeMap` | Static shell route resolution, not order/status/group product metadata | KEPT in browser shell | The entries are route aliases used by header/path helpers. Toolbox/Admin product metadata remains DB/API-backed elsewhere. |
| `adminMainItems` | Admin navigation config | MOVED behind API | Low-risk scoped migration. It only controls generated Admin submenu links for authenticated admins. |
| `localAdminMyStuffItems` | Local/dev Admin navigation config | MOVED behind API | Low-risk scoped migration. It only controls local Admin My Stuff links for authenticated admins in local modes. |

## Implementation

| File | Change |
| --- | --- |
| `src/dev-runtime/server/mock-api-router.mjs` | Added DB/API-shaped Admin navigation contract data and served it from `GET /api/navigation/admin-menu`. The payload includes `adminMainItems`, `localAdminMyStuffItems`, `source`, and ownership classifications. |
| `assets/theme-v2/js/gamefoundry-partials.js` | Removed browser-owned Admin menu item arrays. Admin menu rendering now reads `/api/navigation/admin-menu`; if the API is missing, the Admin submenu shows a visible diagnostic instead of falling back to hardcoded Admin item lists. |

## Deferred Items

| Item | Reason |
| --- | --- |
| Full `routeMap` migration | Too broad for PR_081. Needs a dedicated site navigation contract because it affects all site partial links and active-link behavior. |
| Colors catalog | Explicitly out of scope for this PR. |
| Project Journey suggestions | Explicitly out of scope for this PR. |
| `creator-user` Workspace/Achievements scoping | Explicitly out of scope for this PR. |

## Validation

| Lane | Status | Command | Evidence |
| --- | --- | --- | --- |
| Branch guard | PASS | `git branch --show-current` | Returned `main`. |
| Syntax | PASS | `node --check assets/theme-v2/js/gamefoundry-partials.js` | Exited 0. |
| Syntax | PASS | `node --check src/dev-runtime/server/mock-api-router.mjs` | Exited 0. |
| Navigation ownership static check | PASS | `rg -n "adminMainItems\|localAdminMyStuffItems\|routeMap" assets/theme-v2/js/gamefoundry-partials.js src/dev-runtime/server/mock-api-router.mjs` | Browser file no longer owns Admin menu item arrays; server route owns menu lists. |
| Targeted Playwright | PASS | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs tests/playwright/tools/ToolboxRoutePages.spec.mjs --reporter=line` | 20 passed. Covers header navigation, Admin menu rendering, My Stuff placement, Admin page navigation, and Toolbox routes. |
| Static diff validation | PASS | `git diff --check` | No whitespace errors; Git reported expected LF/CRLF warning for `mock-api-router.mjs`. |

## Impacted Lanes

- Navigation/header runtime
- Admin menu runtime
- Local dev server API contract

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Samples and sample loaders were not changed. |
| Colors runtime | Explicitly out of scope. |
| Project Journey runtime | Explicitly out of scope. |
| Workspace/Achievements user scoping | Explicitly out of scope. |

## Manual Test Notes

No separate manual browser walkthrough was needed after targeted Playwright. The tests opened API-backed local pages and verified Admin/My Stuff menu placement and route visibility through the rendered header.
