# PR_26156_118 Toolbox Name Link Navigation

## Scope
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Updated Toolbox card rendering so each rendered tool name is an `<a>` link.
- Used the shared Toolbox registry route via `getToolRoute()` for the tool-name target.
- Preserved existing card layout, status badges, registry image behavior, preview-image links, and `Open Tool` launch actions.
- Did not add duplicate navigation controls.
- Did not modify Toolbox registry metadata.
- Did not modify `start_of_day`.

## Implementation Notes
- `toolbox/tools-page-accordions.js`
  - Imports `getToolRoute()` from `toolbox/toolRegistry.js`.
  - Adds a shared heading helper that wraps tool names in `h3 > a`.
  - Stores the exact registry route in `data-registered-tool-route`.
  - Uses a root-relative `href` for actual browser navigation, for example `/toolbox/game-design/index.html`, so links resolve correctly from `/toolbox/index.html`.
  - Leaves `.card-media-link` and `.card-body > a.btn` launch targets unchanged.
- `tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`
  - Adds targeted coverage for all rendered Toolbox card name links.
  - Verifies each name link maps to the registered route.
  - Verifies existing preview and Open Tool actions remain present and unchanged.
  - Click-checks the Game Design name link and confirms it resolves to the registered tool page.

## Validation Notes
- Impacted lane: `tool-navigation`.
- Command: `npm run test:lane:tool-navigation`.
- Result: PASS, 6 Playwright tests.
- Static checks:
  - `node --check toolbox/tools-page-accordions.js` - PASS
  - `node --check tests/playwright/tools/ToolNavigationPrevNext.spec.mjs` - PASS
  - Scoped `git diff --check` for changed implementation/test files - PASS
- Targeted guard checks:
  - No local CSS, inline styles, script blocks, or `start_of_day` references were introduced in changed implementation/test files.

## Manual Test Notes
- Toolbox page was exercised at `/toolbox/index.html?role=admin`.
- Every rendered Toolbox card had one tool-name anchor.
- Tool-name anchors carried the registered route in `data-registered-tool-route`.
- Game Design name link navigated to `/toolbox/game-design/index.html`.
- Existing preview-image link and `Open Tool` button targets stayed unchanged.
- No console errors or failed page requests were reported by the targeted lane.

## Skipped Lanes
- Full samples smoke: skipped by request.
- Tool image lane: skipped because image behavior was preserved and not the target of this PR.
- Broad Project Workspace/runtime suites: skipped because this PR only changes Toolbox card name navigation and the `tool-navigation` lane owns the affected route behavior.
