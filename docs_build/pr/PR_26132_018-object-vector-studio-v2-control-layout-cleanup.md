# PR_26132_018-object-vector-studio-v2-control-layout-cleanup

## Scope

Updates Object Vector Studio V2 UI layout only. No schema changes, no sample JSON changes, and no new feature systems.

## Changes

- Reduced stacked accordion spacing and kept removed useful help/status text in Status Log.
- Moved Shape/Tools to the top of the right column, removed its visible hint paragraph, kept its content scrollable, and made tool buttons square.
- Moved Words/Icons beside Grid and preserved icon mode for preview/frame action buttons.
- Added a selectable shape list inside Object Details for the selected object.
- Moved Object Details under Object in the left column and moved object/shape counts into the Object Details header.
- Moved Dependency Graph into its own right-column accordion.
- Reworked Palette as an accordion with Paint, Stroke, Current Color, Stroke Width, header swatch count, square swatches, and internal scrolling.
- Moved Object Preview coordinate/status text into the Object Preview header and removed the old visible selection/render summary blocks.
- Added Copy JSON inside JSON Details without changing accordion open/closed state.

## Validation

Playwright impacted: Yes.

Commands run:

- `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- `node --check tools/object-vector-studio-v2/js/bootstrap.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `node --check tools/object-vector-studio-v2/tests/playwright/FirstClassToolStarter.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --grep "Object Vector Studio V2" --reporter=list`
- `npm run test:workspace-v2`

Result:

- Targeted Object Vector Studio V2 validation passed: 6 passed.
- Full Workspace Manager V2 suite passed: 45 passed.
- Playwright V8 coverage generated at `docs_build/dev/reports/playwright_v8_coverage.txt`.
- Full samples smoke test skipped per request; this PR only changes Object Vector Studio V2 UI layout and workspace-v2 coverage validates the impacted surface.

## Playwright Coverage

Validates:

- Shape/Tools is in the right column.
- Object Details is under Object in the left column.
- Words/Icons is beside Grid.
- Shape/tool buttons are square.
- Object tiles do not overlap on load.
- Shapes inside the selected object can be selected from the new shape list.
- JSON Details Copy JSON preserves accordion state.
- Removed useful status/help text appears in Status Log.

Expected pass behavior:

- Layout controls move to the requested columns, compact content scrolls internally, selectable shape rows are clickable, and JSON copy does not toggle the accordion.

Expected fail behavior:

- Invalid payloads, missing payloads, missing palette, or missing selected object still log visible/actionable failures and block invalid rendering or mutations.

## Manual Validation

1. Open `tools/object-vector-studio-v2/index.html`.
2. Confirm left column order: Object, Object Details, Objects.
3. Confirm right column order: Shape/Tools, Palette, JSON Details, Dependency Graph, Status Log.
4. Load a valid Object Vector payload with a runtime palette.
5. Create multiple shapes, then select shapes from the Object Details shape list.
6. Confirm Paint/Stroke, Current Color, Stroke Width, and palette swatches sit at the top of Palette.
7. Click JSON Details `Copy JSON` and confirm the accordion stays open.

Expected outcome:

- Object Vector Studio V2 has tighter accordions, usable right-column Shape/Tools, non-overlapping object tiles, clickable shape selection, palette controls at the top, and stable JSON copy behavior.

## Out Of Scope

- No schema changes.
- No sample JSON changes.
- No new feature systems.
- No full samples smoke test.
