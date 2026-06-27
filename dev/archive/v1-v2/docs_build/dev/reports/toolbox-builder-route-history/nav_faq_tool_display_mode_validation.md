# PR_26152_011-nav-faq-tool-display-mode Validation

Playwright impacted: Yes

## Scope

- Added the existing About page and new FAQ page to the shared Game Foundry Studio NAV.
- Added `GameFoundryStudio/faq.html` using the shared site/account page structure and CSS classes.
- Updated shared `tool-display-mode` so normal, non-fullscreen mode shows the page `ToolName` instead of center-panel descriptive text.
- Updated normal `tool-display-mode` text/color/alignment treatment to match the fullscreen name treatment.

No sample JSON was modified.

## Lanes Executed

- contract/static - changed HTML/CSS/JS restrictions, route map, nav links, and CSS selector checks.
- runtime/browser - targeted Playwright browser validation for the shared NAV partial, About page, FAQ page, normal tool display mode, and focus/fullscreen toggle behavior.
- workspace-contract - required `npm run test:workspace-v2` was attempted; see WARN below.

## Lanes Skipped

- engine - no `src/`, engine runtime, rendering, input, audio, physics, asset loading, or shared parser code changed.
- samples - SKIP because sample JSON and shared sample loading were not in scope.
- full samples smoke - SKIP per BUILD instruction and because this PR does not broadly affect samples.

## Commands And Results

- PASS: `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- PASS: `node --check GameFoundryStudio/assets/js/tool-display-mode.js`
- PASS: inline Node static validation for changed HTML/CSS/JS.
  - Verified no inline `<style>` blocks, inline `<script>` blocks, inline `style` attributes, or inline event handlers in changed HTML/partial files.
  - Verified About and FAQ links exist in `header-nav.html`.
  - Verified `about` and `faq` routes exist in `gamefoundry-partials.js`.
  - Verified `tool-display-mode.js` uses `toolName` for the normal display description.
  - Verified changed CSS has balanced braces and the expected display-mode shadow, center alignment, gold color, and strong weight.
- PASS: targeted Playwright browser validation through a temporary local HTTP server.
  - Verified About and FAQ render in shared NAV and resolve to `about.html` and `faq.html`.
  - Verified About nav link is active on `about.html`.
  - Verified FAQ page renders, has the FAQ nav link active, and includes four FAQ accordions.
  - Verified normal/non-fullscreen Game Builder display mode shows `Game Builder`, not `Game Builder turns the de...`.
  - Verified normal/non-fullscreen display-mode text color and weight match fullscreen name treatment.
  - Verified display-mode click enters focus/fullscreen mode, collapses the details body, shows fullscreen name `Game Builder`, exits focus/fullscreen mode, and reopens details.
- WARN: `npm run test:workspace-v2`
  - Attempt 1 timed out after 124 seconds with no stdout/stderr completion.
  - Attempt 2 timed out after 604 seconds with no stdout/stderr completion.
  - The timed-out child Node/Playwright processes were stopped after timeout cleanup.
  - Direct target listing confirmed the lane expands to 72 tests in `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
- PASS: direct workspace-contract sanity check:
  - `node node_modules/@playwright/test/cli.js test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "registers Workspace Manager V2 from the tools index"`
  - Result: 1 passed.

## Playwright V8 Coverage

(100%) GameFoundryStudio/assets/js/gamefoundry-partials.js - 5512 of 5512 bytes executed in targeted nav/tool-display browser validation.
(100%) GameFoundryStudio/assets/js/tool-display-mode.js - 5138 of 5138 bytes executed in targeted nav/tool-display browser validation.

## Manual Validation Steps

1. Open `GameFoundryStudio/index.html` through a local HTTP server.
2. Confirm the shared top NAV includes `About` and `FAQ`.
3. Open `GameFoundryStudio/about.html` and confirm the About NAV link is active.
4. Open `GameFoundryStudio/faq.html` and confirm the FAQ NAV link is active and the FAQ accordions render.
5. Open `GameFoundryStudio/tools/game-builder.html`.
6. Confirm normal/non-fullscreen `tool-display-mode` shows `Game Builder` instead of the long descriptive sentence.
7. Click the display-mode summary to enter focus/fullscreen mode and confirm the fullscreen label remains `Game Builder`.
8. Click the display-mode summary again to exit and confirm normal mode reopens.

## Expected PASS Behavior

- About and FAQ appear in the shared site NAV on root, nested, and tool pages.
- FAQ uses the shared header, footer, page title, account panel, side menu, card, accordion, and callout CSS patterns.
- Normal/non-fullscreen tool display mode shows the current page `ToolName`.
- Fullscreen/focus behavior remains unchanged: click enters focus/fullscreen treatment, click exits, and details reopen.

## Expected WARN Behavior

- `npm run test:workspace-v2` is WARN because the exact required command did not complete within 604 seconds in this environment. The issue is isolated to the large workspace-contract lane execution, not this PR's changed NAV/FAQ/tool-display files.
