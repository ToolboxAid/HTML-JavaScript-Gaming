# PR_26133_013 Workspace V2 Results

## Command Results

- `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`: passed.
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`: passed.
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --grep "Object Vector Studio V2 (layout shell|preview coordinates|preview shapes with mouse actions|asset authoring controls)"`: 4 passed.
- `npm run test:workspace-v2`: 47 passed.
- `git diff --check`: passed with LF-to-CRLF working-copy warnings for touched files.

## Targeted Object Vector Studio V2 Verification

- Confirmed negative snapped Move X/Move Y values move the selected shape back across both axes instead of snapping half-step negatives to zero.
- Confirmed Object Transform summary renders as `Transform x 0, y 0, rot 0, scale 1 x 1` and updates after transform actions.
- Confirmed Object Preview controls use compact final-word labels and include working Up/Down pan controls after In.
- Confirmed Object actions render as a single compact Add/Rename/Dup/Delete row.
- Confirmed the center origin dot renders at radius 9.
- Confirmed preview mouse drag, negative drag, rectangle handle resize, and line endpoint movement still edit the selected shape.
- Confirmed Polygon Geometry renders separate X/Y point inputs, applies valid edits, marks invalid point cells with `aria-invalid`, and preserves invalid text without partial apply.
- Confirmed the polygon point list uses a fixed scrolling area.
- Confirmed Ellipse Geometry renders as two inline label/input rows: Cx/Cy, then Rx/Ry.
- Confirmed Object Preview coordinate/grid/zoom expectations from prior PRs remain covered by the workspace-v2 suite.
- Confirmed targeted Object Vector Studio tests reported no console/page errors.

## Scope Checks

- Existing Object Vector Studio V2 JSON contracts were preserved.
- No sample JSON files were changed.
- No unrelated tool/runtime files were changed.
