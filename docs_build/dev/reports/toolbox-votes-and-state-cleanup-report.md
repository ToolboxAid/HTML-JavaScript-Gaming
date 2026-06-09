# PR_26160_056 Toolbox Votes And State Cleanup Report

## Branch Validation

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current git branch before changes | `main` | `main` | PASS |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Treat Toolbox vote controls as monitorable shared data, not non-persistent wireframe-only controls | PASS | `src/dev-runtime/server/mock-api-router.mjs` owns shared server-side Toolbox vote state; `src/engine/api/toolbox-votes-api-client.js` exposes snapshot/cast API calls; `toolbox/tools-page-accordions.js` reads/casts through the API client. |
| Add an Admin votes review wireframe/page | PASS | Added `admin/tool-votes.html` and `admin/tool-votes.js`; Playwright verifies the page renders and reads vote totals/current-user state. |
| Review totals by tool, vote direction, and current user vote state | PASS | Admin table columns: Tool, Group, State, Up, Down, Current User Vote. |
| Preserve one-vote-per-user per tool | PASS | `castToolboxVote` changes a user from Up to Down by decrementing the previous direction and incrementing the new direction; Playwright verifies Up -> Down for the same user. |
| Colors is the only complete tool | PASS | Registry audit: `complete` count is 1 and the only complete tool is `colors`. |
| Achievements, Build Game, Saved Data, and Languages are wireframe | PASS | Registry audit: `wireframe` tools are exactly `achievements`, `build-game`, `saved-data`, and `languages`. |
| Previously Complete tools other than Colors become beta | PASS | Registry audit: `project-workspace`, `project-journey`, `game-design`, `game-configuration`, and `assets` are `beta`. |
| All remaining tools become planned | PASS | Registry audit: remaining visible tools resolve to `planned`; no group labels are treated as states. |
| Move state badge/value to the bottom of each Toolbox tile | PASS | `toolbox/tools-page-accordions.js` appends `createStateLabel(tool)` after the other tile body parts; Playwright verifies the Colors state badge is the final card-body child. |
| Preserve group labels such as AI, Design, Audio, Assets, Build, System, Community, and Admin as group metadata, not states | PASS | `createGroupLabel` remains separate from `createStateLabel`; Playwright verifies group badge and state badge are separate DOM nodes. |
| Keep Toolbox card order otherwise aligned | PASS | Playwright verifies Build Game order: action row, feedback controls, plan details, bottom state badge. |
| Do not wire new tool wireframes to runtime code | PASS | The four tool wireframe pages remain static controls with only shared Theme V2 scripts. |
| Do not use inline script, inline style, or inline event handlers | PASS | Inline scan returned no matches for the touched HTML pages. |

## State Audit

```text
counts: planned 28, beta 5, complete 1, wireframe 4
wireframe: build-game, saved-data, languages, achievements
complete: colors
beta: project-workspace, project-journey, game-design, game-configuration, assets
```

## Impacted Lane

- Toolbox/page validation.
- Toolbox card display and state filters.
- Toolbox vote behavior through server API.
- Admin Tool Votes review visibility.

## Validation Evidence

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/gamefoundry-partials.js; node --check admin/tool-votes.js; node --check src/engine/api/toolbox-votes-api-client.js; node --check src/dev-runtime/server/mock-api-router.mjs; node --check toolbox/toolRegistry.js; node --check toolbox/tools-page-accordions.js; node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS |
| `node scripts/validate-tool-registry.mjs` | PASS |
| Inline script/style/event-handler `rg` scan over touched HTML | PASS, no matches |
| Registry state audit for complete/wireframe/beta/planned | PASS |
| `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --reporter=line` | PASS, 5/5 |
| `npx playwright test tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs --reporter=line` | PASS, 5/5 |
| `git diff --check -- ...` | PASS, line-ending warnings only |

## Coverage Notes

- `docs_build/dev/reports/playwright_v8_coverage_report.txt` was refreshed.
- Browser V8 coverage covered `assets/theme-v2/js/gamefoundry-partials.js`, `src/engine/api/toolbox-votes-api-client.js`, `toolbox/tools-page-accordions.js`, and `assets/theme-v2/js/tool-display-mode.js`.
- Advisory WARN entries remain for server-side `src/dev-runtime/server/mock-api-router.mjs` and registry `toolbox/toolRegistry.js`, which are not collected directly by browser V8 coverage.

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Explicitly skipped per request; no sample loader or sample manifest behavior changed. |
| Full test suite | Not required for this targeted Toolbox/Admin vote review PR. |
| Non-Toolbox runtime lanes | Not affected by the Toolbox state/vote/Admin review changes. |

## Manual Test Notes

- Branch guard passed before changes: current branch `main`, expected `main`.
- Toolbox vote controls now say votes are recorded for Admin review instead of non-persistent wireframe controls.
- Admin `Tool Votes` route is added to the admin menu through `gamefoundry-partials.js`; it is still protected by the existing admin page guard.
- The Admin review page is read-only and does not add edit/write controls.

