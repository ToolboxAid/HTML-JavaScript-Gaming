# PR_26159_054-toolbox-status-and-display-cleanup

## Branch Guard

| Requirement | Status | Evidence |
| --- | --- | --- |
| Current branch must be `main` before BUILD work | PASS | `git branch --show-current` returned `main`; local branch list showed `* main`. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Assets shows user-facing Beta | PASS | `toolbox/toolRegistry.js` sets `releaseChannel: "beta"` for Assets; Node registry probe returned `Assets: beta/Beta`; Playwright `ToolboxRoutePages.spec.mjs` verified Beta tile. |
| Game Config / Game Configuration shows user-facing Beta | PASS | `toolbox/toolRegistry.js` sets Game Configuration `releaseChannel: "beta"`; Node probe returned `Game Configuration: beta/Beta`; Playwright verified Beta tile. |
| Game Design shows user-facing Beta | PASS | `toolbox/toolRegistry.js` sets Game Design `releaseChannel: "beta"`; Node probe returned `Game Design: beta/Beta`; Playwright verified Beta tile. |
| Project Journey shows user-facing Beta | PASS | `toolbox/toolRegistry.js` sets Project Journey `releaseChannel: "beta"`; Node probe returned `Project Journey: beta/Beta`; Playwright verified Beta tile. |
| Project Workspace shows user-facing Beta | PASS | `toolbox/toolRegistry.js` sets Project Workspace `releaseChannel: "beta"`; Node probe returned `Project Workspace: beta/Beta`; Playwright verified Beta tile. |
| Wireframe tools show user-facing Planned | PASS | `RELEASE_CHANNEL_BY_STATUS.Wireframe` now maps to `planned` in `toolbox/toolRegistry.js` and `toolbox/tools-page-accordions.js`; Node probe returned `AI Assistant: Planned`, `Fonts: Planned`, `Sprites: Planned`, `Characters: Planned`, `Objects: Planned`; Playwright verified Fonts shows Planned. |
| User-facing status set limited to Planned, Beta, Complete | PASS | `TOOL_RELEASE_CHANNELS` contains only `planned`, `beta`, `complete`; Node probe returned `labels=Beta,Complete,Planned`; Playwright verified no Wireframe filter exists. |
| Status filters/counts reflect Planned/Beta/Complete | PASS | `toolbox/tools-page-accordions.js` uses `["complete", "beta", "planned"]`; Playwright verified side-by-side filters, default Complete/Beta active, Planned inactive, and no Wireframe filter. |
| Do not expose old internal status wording to users unless intentionally admin-only | PASS | Toolbox filter/kicker/help/status text no longer exposes Wireframe; visible launch status in `toolbox/index.html` now says Complete/Beta/Planned. Internal `Wireframe` status values remain for registry/admin compatibility only. |
| Swatch label word/background uses actual swatch color | PASS | `assets/theme-v2/css/status.css` adds reusable `.swatch-label`; `toolbox/tools-page-accordions.js` applies existing `swatch-*` classes to group label text; Playwright verified Design label background `rgb(255, 79, 139)` and readable white text. |
| No inline styles/page-local CSS | PASS | CSS added only to reusable Theme V2 `assets/theme-v2/css/status.css`; source probe verified no inline script/style/event handlers were added to `toolbox/index.html`. |
| Investigate `tool-display-mode.js` and remove only if unused/replaced | PASS | `rg` found 44 active non-archive references across `admin/` and `toolbox/`; `ToolDisplayModeNavigation.spec.mjs` passed. The file is the active shared display/fullscreen implementation, so it was preserved. |
| Confirm no broken script references | PASS | Active script reference scan found live references to the existing file; no references were removed. Toolbox and display-mode Playwright lanes passed with no 4xx/console failures. |
| Fullscreen/display behavior still works | PASS | `npx playwright test tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs --reporter=line` passed 5/5. |
| No console errors | PASS | `ToolboxRoutePages.spec.mjs` and `ToolDisplayModeNavigation.spec.mjs` both collect page errors, failed requests, and console errors; both lanes passed. |

## Old Display-Mode Cleanup Findings

`assets/theme-v2/js/tool-display-mode.js` is not an unused stopped implementation in the current branch. It remains the active shared Tool V2 display shell for identity rows, registry navigation, side-column collapse controls, and fullscreen/focus-mode behavior.

Evidence:
- Active references: `rg -n "tool-display-mode\.js" admin toolbox assets src --glob "*.html" --glob "*.js" --glob "*.mjs"` returned 44 active non-archive references.
- Runtime validation: `ToolDisplayModeNavigation.spec.mjs` passed 5/5.

Action taken: preserved `tool-display-mode.js`; no references/imports removed.

## Validation

| Lane | Status | Evidence |
| --- | --- | --- |
| Project instructions read | PASS | `docs_build/dev/PROJECT_INSTRUCTIONS.md` read before edits. |
| JS syntax checks | PASS | `node --check toolbox/toolRegistry.js`, `toolbox/tools-page-accordions.js`, and `tests/playwright/tools/ToolboxRoutePages.spec.mjs` passed. |
| Tool registry validation | PASS | `node scripts/validate-tool-registry.mjs` returned `TOOL_REGISTRY_VALID`. |
| Toolbox Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --reporter=line` passed 3/3. |
| Display-mode Playwright | PASS | `npx playwright test tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs --reporter=line` passed 5/5. |
| Whitespace/static diff check | PASS | `git diff --check` on changed PR files passed. |
| V8 coverage report | PASS | Playwright V8 coverage reports were refreshed in `docs_build/dev/reports/playwright_v8_coverage_report.txt` and `coverage_changed_js_guardrail.txt`. |

## Skipped / Not Run

| Lane | Reason |
| --- | --- |
| Full samples validation | Explicitly not requested; no sample loader/framework files changed. |
| Full Playwright suite | Scope is Toolbox status/display behavior; targeted Toolbox and display-mode lanes were run. |

## Notes

An attempted broader `RootToolsFutureState.spec.mjs` run failed on existing header/auth expectations before PR-specific status assertions. That file was left out of this PR to avoid mixing unrelated stale header-test cleanup into the toolbox status/display cleanup.
