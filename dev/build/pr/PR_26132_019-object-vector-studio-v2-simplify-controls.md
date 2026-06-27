# PR_26132_019-object-vector-studio-v2-simplify-controls

## Scope

Updates Object Vector Studio V2 UI/control behavior only. No schema changes, no sample JSON changes, no World Vector Studio V2 runtime changes.

## Changes

- Simplified Shape/Tools so Words/Icons affects only shape buttons; reset, viewport, grid, snap, frame, and runtime buttons remain text-only.
- Replaced shape initials with visual icons for select, triangle, rectangle, circle, ellipse, line, polygon, arc, and text.
- Added a separator between shape tools and grid/snap controls, kept shape buttons square, and let the grid fit as many buttons across as available.
- Removed hardcoded category/tag controls and replaced them with editable object tags plus a dynamic tag filter.
- Removed Object Type, Template, active state UI, and active library asset UI from the current editing surface; deferred notes are logged/status-documented.
- Reworked Palette controls: removed Current Color, added hue/sat/bri/name sort buttons, kept square swatches, and exposed stacked hover details.
- Removed duplicate SVG grid rendering; the remaining CSS grid is toggled by the Grid button.
- Moved Object Preview actions under the canvas and placed the selected object id in the center-column footer.
- Added selected-object shape rows under the active object tile, with selected object/shape highlighting.
- Added runtime-only object eye/lock controls and shape eye controls; object lock blocks mutating edits.
- Started JSON Details, Dependency Graph, and Status Log collapsed in the right column.
- Moved Object Details action buttons under the canvas and kept Object Details focused on selected-shape editable fields.

## Validation

Playwright impacted: Yes.

Commands run:

- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=line -g "Object Vector Studio V2 layout shell|expands Object Vector Studio V2 asset authoring|animation states" --timeout=120000`
- `npm run test:workspace-v2`

Result:

- Targeted Object Vector Studio V2 checks passed: 3 passed.
- Full Workspace Manager V2 suite passed: 45 passed.
- Playwright V8 coverage refreshed at `docs_build/dev/reports/playwright_v8_coverage.txt`.
- Full samples smoke test skipped per request; this PR is limited to Object Vector Studio V2 UI/control behavior and workspace-v2 coverage validates the impacted surface.

## Playwright Coverage

Validates:

- Words/Icons affects only Shape/Tools buttons.
- Real shape icons render.
- Object/shape selection rows highlight correctly.
- Object and shape visibility controls work.
- Object lock blocks edits.
- Duplicate SVG grid rendering is absent and the Grid button toggles the remaining grid.
- Palette sorting controls render.
- Right-column JSON Details, Dependency Graph, and Status Log start collapsed.
- Object Type and Template UI are removed.

Expected pass behavior:

- Simplified controls render in the requested layout, object/tag filtering works without hardcoded category lists, and runtime-only object visibility/lock state updates without changing schema payloads.

Expected fail behavior:

- Missing payloads, invalid payloads, missing palette, locked objects, or missing selections log visible/actionable WARN/FAIL entries and do not silently mutate or render invalid state.

## Manual Validation

1. Open `toolbox/object-vector-studio-v2/index.html`.
2. Load a valid Object Vector payload with a runtime palette.
3. Confirm Shape/Tools shows visual icons, square buttons, and Words/Icons only changes those buttons.
4. Add/edit object tags and confirm Tag Filter options come from loaded object tags.
5. Toggle object eye/lock controls and confirm hidden objects stop rendering and locked objects block edits.
6. Toggle Grid and confirm the single visible grid appears/disappears.
7. Confirm JSON Details, Dependency Graph, and Status Log start collapsed.

Expected outcome:

- Object Vector Studio V2 presents a cleaner control surface with no Object Type/Template UI, dynamic tags, working object/shape visibility, runtime object locking, and no duplicate grid rendering.

## Out Of Scope

- No schema changes.
- No sample JSON changes.
- No new major feature systems.
- No World Vector Studio V2 runtime mutation changes.
- No full samples smoke test.
