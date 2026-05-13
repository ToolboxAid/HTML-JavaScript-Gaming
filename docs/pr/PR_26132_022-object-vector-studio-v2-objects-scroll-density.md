# PR_26132_022-object-vector-studio-v2-objects-scroll-density

## Scope

Updates Object Vector Studio V2 Objects hierarchy scrolling and row density only. No schema changes, no unrelated controls, and no sample JSON changes.

## Changes

- Preserved `objectVectorStudioV2ObjectsContent` scroll position across object and shape selection re-renders.
- Added an explicit Objects content element binding so render code restores the correct scroll container.
- Tightened object hierarchy spacing by reducing shape-list gaps, padding, row height, and metadata line height.
- Reduced shape row font sizing while keeping labels readable.
- Shortened shape hierarchy labels under selected objects to dense row labels such as `0. small-ufo-body` and `1. small-ufo-canopy`.
- Kept the object-level label such as `objects > Small UFO` intact on the selected object tile.

## Validation

Playwright impacted: Yes.

Commands run:

- `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- `node --check tools/object-vector-studio-v2/js/bootstrap.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "shows Object Vector Studio V2 layout shell"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "uses header lifecycle controls"`
- `npm run test:workspace-v2`

Result:

- Focused Object Vector Studio V2 hierarchy coverage passed.
- Focused Workspace Manager launch coverage passed.
- Full Workspace Manager V2 suite passed: 45 passed.
- Playwright V8 coverage refreshed at `docs/dev/reports/playwright_v8_coverage.txt`.
- Full samples smoke test skipped per request.

## Playwright Coverage

Validates:

- Objects scroll position persists when selecting a shape from the hierarchy.
- Objects scroll position persists when selecting another object.
- Shape hierarchy rows use reduced font sizing, line height, row height, and spacing.
- Workspace-launched Asteroids Object Vector payload keeps `objects > Small UFO` and renders compact shape rows `0. small-ufo-body` and `1. small-ufo-canopy`.

Expected pass behavior:

- Object Vector Studio V2 selection updates highlight state and details without jumping the Objects container scroll position.
- Shape hierarchy rows are visibly denser while staying readable.

Expected fail behavior:

- Invalid payloads and blocked actions continue using existing visible Status Log WARN/FAIL behavior without partial render or silent fallback.

## Manual Validation

1. Open `tools/object-vector-studio-v2/index.html`.
2. Load a valid Object Vector payload with enough objects to scroll the Objects accordion.
3. Scroll the Objects accordion downward, then select a visible object or shape.
4. Confirm the scroll position remains stable after the selected state updates.
5. Select an object with multiple shapes, such as Small UFO from the Asteroids workspace payload.
6. Confirm the object label remains readable and shape rows are compact, for example `0. small-ufo-body` and `1. small-ufo-canopy`.

Expected outcome:

- The Objects hierarchy remains stable during selection and displays more rows in the same vertical space.

## Out Of Scope

- No schema changes.
- No unrelated controls.
- No sample JSON changes.
- No full samples smoke test.
