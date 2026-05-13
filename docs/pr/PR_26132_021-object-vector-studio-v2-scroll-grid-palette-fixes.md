# PR_26132_021-object-vector-studio-v2-scroll-grid-palette-fixes

## Scope

Updates Object Vector Studio V2 layout/control behavior and the Asteroids Object Vector asset tags only. No schema changes and no unrelated game changes.

## Changes

- Added left-column vertical scrolling.
- Let `objectVectorStudioV2ShapeToolsContent` fill to the bottom of its accordion while preserving `accordion-v2__content object-vector-studio-v2__scroll-content`.
- Added Words/Icons support and CSS icons for Bring Forward, Send Backward, Bring To Front, Send To Back, Group Shapes, and Ungroup.
- Increased rectangle, circle, ellipse, arc, and polygon icon stroke weight and made those icons white.
- Reworked the triangle icon to be unfilled with a white stroke matching rectangle stroke weight.
- Removed the `asteroids` tag from Asteroids Object Vector Studio V2 asset library entries.
- Removed the visible ` x` suffix from object tag pills and added numeric duplicate tag resolution.
- Changed viewport zoom buttons and mouse wheel zoom to 10% steps, with clamped min/max reachability from 25% to 400%.
- Moved grid rendering into SVG coordinates so it scales with the center dot and current viewBox.
- Rejected non-palette paint/stroke colors with visible Status Log failures.
- Kept Object action buttons inside the Objects accordion bottom and removed the separate Object Actions callout.
- Kept Objects list overflow visible while the Objects container scrolls.
- Put Tag Filter and Search labels/fields on one line.

## Validation

Playwright impacted: Yes.

Commands run:

- `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- `node --check tools/object-vector-studio-v2/js/bootstrap.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `node --check tools/object-vector-studio-v2/tests/playwright/FirstClassToolStarter.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "shows Object Vector Studio V2 layout shell"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "expands Object Vector Studio V2 asset authoring"`
- `npx playwright test --config tools/object-vector-studio-v2/playwright.config.mjs --reporter=list`
- `npm run test:workspace-v2`

Result:

- Focused Object Vector Studio V2 layout/control coverage passed.
- Tool-local Object Vector Studio V2 suite passed: 4 passed.
- Full Workspace Manager V2 suite passed: 45 passed.
- Playwright V8 coverage refreshed at `docs/dev/reports/playwright_v8_coverage.txt`.
- Full samples smoke test skipped per request; this PR is limited to Object Vector Studio V2 layout/control behavior and Asteroids Object Vector asset tags.

## Playwright Coverage

Validates:

- Left column scrolling.
- Shape/Tools content reaches the accordion bottom.
- Words/Icons affects z-order/group buttons.
- White, heavier shape icons and unfilled triangle styling.
- Asteroids `asteroids` tag removal from Object Vector asset entries.
- Tag creation does not append ` x`, and duplicate tags receive numeric suffixes.
- 10% zoom steps and mouse-wheel min/max zoom reachability.
- SVG grid scales in the same coordinate surface as the center dot.
- Non-palette paint/stroke colors are rejected.
- Object actions are inside the Objects accordion bottom.
- Objects list overflow stays visible while the Objects container scrolls.
- Tag Filter and Search controls render as inline rows.

Expected pass behavior:

- Object Vector Studio V2 shows the requested scroll, grid, icon, tag, palette, and Object action behavior without schema drift or hidden fallback behavior.

Expected fail behavior:

- Missing payloads, missing palette, locked object edits, invalid transforms, and non-palette paint/stroke colors log visible/actionable WARN/FAIL entries and avoid partial mutation.

## Manual Validation

1. Open `tools/object-vector-studio-v2/index.html`.
2. Load a valid Object Vector payload and runtime palette.
3. Confirm the left column scrolls when content exceeds its height.
4. Toggle Words/Icons and confirm z-order/group buttons switch with the shape buttons.
5. Confirm rectangle, circle, ellipse, arc, and polygon icons are white with heavier strokes, and triangle is outline-only.
6. Add a tag, then add the same tag again; confirm the first tag has no ` x` suffix and the duplicate gets a numeric suffix.
7. Use Zoom In/Out and mouse wheel to confirm 10% zoom steps and min/max clamp at 25% and 400%.
8. Toggle Grid and confirm the SVG grid scales with the center dot while zooming.
9. Try applying a non-palette color through runtime state and confirm the Status Log rejects it.
10. Confirm Object actions remain at the bottom of the Objects accordion and the filter/search controls are inline.

Expected outcome:

- The Object Vector Studio V2 editing surface behaves as requested with constrained scroll regions, valid palette-only paint/stroke operations, SVG-coordinate grid scaling, and no Asteroids asset-library `asteroids` tag.

## Out Of Scope

- No schema changes.
- No unrelated game changes.
- No World Vector Studio V2 changes.
- No full samples smoke test.
