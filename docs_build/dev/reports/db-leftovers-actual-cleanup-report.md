# PR_26160_083 DB Leftovers Actual Cleanup

Generated: 2026-06-09

## Branch Validation

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current branch | `main` | `main` | PASS |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Complete DB leftovers cleanup missed by PR_26160_082 | PASS | Migrated scoped leftover browser-owned Colors/Journey/identity data and updated stale validation to current DB/API SSoT behavior. |
| Audit and migrate remaining Colors catalog/grid product data behind API/service contract backed by DB adapter | PASS | Colors catalog/config moved from `toolbox/colors/colors.js` to `src/dev-runtime/persistence/tool-repositories/palette-catalog-config.js`; served through `/api/toolbox/colors/constants` by `src/dev-runtime/server/mock-api-router.mjs`; browser reads via `toolbox/colors/palette-api-client.js`. |
| Audit and migrate Project Journey hardcoded suggestions/metadata behind API/service contract backed by DB adapter | PASS | Suggested-tool metadata moved to `PROJECT_JOURNEY_SUGGESTED_TOOLS` in `src/dev-runtime/persistence/tool-repositories/project-journey-mock-repository.js`; served through Project Journey constants endpoint and consumed by `toolbox/project-journey/project-journey.js`. |
| Replace hardcoded creator-user usage with user/session/auth-backed DB user identity where safely scoped | PASS | Removed active `creator-user` / `Creator User` occurrences from `assets`, `toolbox`, `src`, and active Playwright scope. Project Workspace dev data now uses shared `MOCK_DB_KEYS` user keys; Project Workspace and Achievements browser code resolve current session user through `/api/session/current`. |
| Complete navigation follow-up only if route/admin menu data is product data | PASS | No runtime change needed. PR_081 already moved Admin menu items to `/api/navigation/admin-menu`; `routeMap` remains static shell route resolution per server ownership metadata. |
| Final enforcement pass for page-local product arrays, hardcoded counts, duplicated metadata, browser storage as product SSoT, and UI-only product state | PASS | Scoped scans found no remaining browser-owned Colors catalog arrays, Journey `suggestionsByType`, active `creator-user`, local/session storage product SSoT, or inline handlers in affected files. UI arrays left in browser are transient render state/generated-grid computation only. |
| Do not change Theme V2 colors | PASS | No Theme V2 color CSS files were changed. |
| Do not migrate unrelated game/sample runtime data | PASS | No sample JSON or unrelated game runtime data was changed. |
| Do not use inline script/style/event handlers | PASS | Targeted inline audit returned no matches for touched HTML surfaces. |

## Leftover Cleanup Audit

| Area | Finding | Action | Status |
| --- | --- | --- | --- |
| Colors catalog/grid config | Browser owned curated catalog, tag suggestions, selector options, variants, and slider defaults. | Moved ownership to dev-runtime server-side catalog module and served through existing toolbox constants API. | FIXED |
| Colors runtime state | Browser keeps editor issues, selected filters, generated swatch arrays, and preview rows. | Classified as UI/runtime state and generated output, not product SSoT. | KEEP |
| Project Journey suggestions | Browser owned note-type-to-tool suggestion map. | Moved to server-side Project Journey constants and removed hardcoded browser fallback suggestions. | FIXED |
| Project Journey registry lookup | Browser uses API-backed tool registry client to resolve suggested tool names to current tools. | Kept because the registry client already reads `/api/toolbox/registry/snapshot`. | KEEP |
| Creator identity | Browser and dev Project Workspace seed code used `creator-user`. | Replaced with session API resolution and shared mock DB user keys. | FIXED |
| Navigation route map | `routeMap` maps `data-route` names to static shell paths. | Not migrated; classified as static shell behavior, not product metadata. | KEEP |
| Admin navigation menu | Admin menu data is product/admin navigation config. | Already API-backed by PR_081 through `/api/navigation/admin-menu`; no follow-up change needed. | KEEP |
| Project Workspace repository model | Project Workspace still has a dev-runtime demo repository table model separate from newer shared product tables. | IDs now use shared user keys. Full Web -> API -> DB migration for Project Workspace is broader than this scoped cleanup. | DEFERRED |

## Final DB SSoT Enforcement Report

| Enforcement Check | Result | Evidence |
| --- | --- | --- |
| Browser-owned Colors catalog arrays | PASS | `toolbox/colors/colors.js` imports catalog/config from `palette-api-client.js`; product arrays live in `src/dev-runtime/persistence/tool-repositories/palette-catalog-config.js`. |
| Browser-owned Journey suggestion map | PASS | `suggestionsByType` scan returned no active matches; browser consumes `PROJECT_JOURNEY_SUGGESTED_TOOLS` from API constants. |
| Hardcoded active creator identity | PASS | `rg -n "creator-user|Creator User|CREATOR_USER_ID" assets toolbox src tests/playwright` returned no matches. |
| Browser storage as product SSoT | PASS | Scoped scan of affected browser files found no `localStorage` or `sessionStorage` product SSoT usage. |
| Hardcoded counts | PASS | Stale validation counts were updated to current DB-backed Toolbox behavior; runtime count logic unchanged. |
| Duplicated metadata | PASS | Colors/Journey metadata moved to server-side constants; Admin navigation remains server API-backed. |
| UI-only product state | PASS | No product state is introduced in UI-only state. Remaining arrays are transient render/filter/generated-grid state. |

## Navigation Ownership Decision

`assets/theme-v2/js/gamefoundry-partials.js` keeps `routeMap` as static shell route resolution for `data-route` links. The Admin menu data (`adminMainItems`, `localAdminMyStuffItems`) is already served by `src/dev-runtime/server/mock-api-router.mjs` at `/api/navigation/admin-menu`, which also reports ownership as navigation config and local/dev navigation config. No navigation runtime files were changed in this PR.

## Validation

| Lane | Status | Command | Evidence |
| --- | --- | --- | --- |
| Branch guard | PASS | `git branch --show-current` | Returned `main`. |
| Changed-file syntax, Colors/server | PASS | `node --check toolbox/colors/colors.js; node --check toolbox/colors/palette-api-client.js; node --check src/dev-runtime/persistence/tool-repositories/palette-catalog-config.js; node --check src/dev-runtime/server/mock-api-router.mjs` | Exited 0 after removing duplicate helper from the moved catalog file. |
| Changed-file syntax, Project Journey | PASS | `node --check toolbox/project-journey/project-journey.js; node --check toolbox/project-journey/project-journey-api-client.js; node --check src/dev-runtime/persistence/tool-repositories/project-journey-mock-repository.js` | Exited 0. |
| Changed-file syntax, auth/user identity | PASS | `node --check toolbox/project-workspace/project-workspace.js; node --check assets/theme-v2/js/account-achievements.js; node --check src/dev-runtime/persistence/tool-repositories/project-workspace-mock-repository.js; node --check src/dev-runtime/persistence/tool-repositories/game-design-mock-repository.js` | Exited 0. |
| Enforcement scans | PASS | `rg` scans for `creator-user`, `suggestionsByType`, browser Colors catalog definitions, and browser storage/product SSoT in scoped files | No blocking active leftovers found. |
| Targeted Playwright, affected surfaces | PASS | `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs tests/playwright/account/AchievementsPage.spec.mjs --reporter=line` | 31 passed. Initial run exposed stale Toolbox-count and old-registry test assertions; those were updated and rerun clean. |
| Inline HTML restriction audit | PASS | `rg -n "onclick=|onchange=|oninput=|onsubmit=|style=|<script(?![^>]+src=)|<style[\s>]" toolbox/colors/index.html toolbox/project-journey/index.html toolbox/project-workspace/index.html account/achievements.html --pcre2` | No matches. |
| Targeted Project Workspace rerun | PASS | `node --check toolbox/project-workspace/project-workspace.js; npx playwright test tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs --reporter=line` | 7 passed after tightening logged-in/no-active-project identity behavior. |
| Static diff validation | PASS | `git diff --check` | No whitespace errors; Git reported expected LF/CRLF warnings for changed files. |

## Impacted Lanes

- Colors runtime/API constants lane
- Project Journey runtime/API constants lane
- Auth/user identity through Project Workspace and Account Achievements
- Targeted validation test maintenance for current DB-backed Toolbox/registry behavior

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Samples and sample loaders were not changed. |
| DB Viewer Playwright | Table/grouping display was not changed. |
| Navigation Playwright | Navigation runtime was audited but not touched; Admin menu was already API-backed from PR_081. |
| Full Toolbox suite | Toolbox runtime was not changed; only stale validation expectations in the Project Workspace/Journey affected test files were updated. |

## Manual Test Notes

Manual validation focus: open Colors and confirm Defined Swatch Selector/Picker Preview still load from the local API; open Project Journey and confirm suggested tool links still render; open Project Workspace/Achievements as Guest or a selected local user and confirm project rows still appear without `creator-user` literals.
