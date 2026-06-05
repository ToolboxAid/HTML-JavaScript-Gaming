# PR_26156_119 Build Path Tool Links Badges

## Scope
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Updated the Build Path screen rendered on `toolbox/index.html`.
- Kept existing Build Path workflow order, status labels, completion values, and progress guidance intact.
- Did not add inline styles, `<style>` blocks, `<script>` blocks, or inline event handlers.
- Did not modify unrelated Toolbox screens.
- Did not modify `start_of_day`.

## Implementation Notes
- `toolbox/tools-page-accordions.js`
  - Replaced the Build Path Tool cell's plain text with a compact registry-backed badge and tool-name link.
  - Each Build Path badge uses the approved registry badge source from `/assets/theme-v2/images/badges/`.
  - Each Build Path tool-name link uses the registered route from `getToolRoute()` and stores it in `data-registered-tool-route`.
  - Browser navigation uses root-relative hrefs such as `/toolbox/game-design/index.html` so links resolve correctly from `/toolbox/index.html`.
  - Missing badge fallback reuses the existing visible image diagnostic behavior and `/assets/theme-v2/images/image-missing.svg`.
- `tests/playwright/tools/BuildPathProgressSimplification.spec.mjs`
  - Added targeted Build Path coverage for badge image paths.
  - Added targeted Build Path coverage for registered tool-name links.
  - Simulated a missing badge image failure and verified the visible diagnostic.
  - Click-checked the Game Design Build Path link.

## Validation Notes
- Impacted lane: `build-path`.
- Command: `npm run test:lane:build-path`.
- Result: PASS, 4 Playwright tests.
- Static checks:
  - `node --check toolbox/tools-page-accordions.js` - PASS
  - `node --check tests/playwright/tools/BuildPathProgressSimplification.spec.mjs` - PASS
  - Scoped `git diff --check` for changed implementation/test files - PASS
- Targeted guard checks:
  - No inline styles, `<style>` blocks, `<script>` blocks, inline event handlers, or `start_of_day` references were introduced in changed implementation/test files.

## Manual Test Notes
- Toolbox Build Path view was exercised at `/toolbox/index.html?role=admin`.
- Every Build Path row retained its existing workflow order.
- Every Build Path tool name rendered as a link with a registered route.
- Every Build Path badge rendered from the approved Theme V2 badge path for the tool.
- Simulated Game Design badge failure displayed `Badge image missing; fallback shown.`.
- Game Design Build Path link navigated to `/toolbox/game-design/index.html`.
- No console errors or failed page requests were reported by the targeted lane.

## Skipped Lanes
- Full samples smoke: skipped by request.
- Tool image lane: skipped because this PR consumes existing approved badge paths and the Build Path lane directly validates the affected UI.
- Broad Project Workspace/runtime suites: skipped because this PR only changes Build Path table UI and preserves existing progress/status content.
