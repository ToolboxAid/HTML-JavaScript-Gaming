# PR_26132_007-object-vector-studio-v2-transform-editing

## Purpose

Add the Object Vector Studio V2 transform and editing foundation on top of the existing shape runtime.

## Scope

- Added selected-shape move, rotate, scale, resize, duplicate, delete, and z-order controls.
- Added optional shape transform validation with explicit rejection for invalid transform values.
- Added selection bounding box, resize handle markers, and pivot/origin visualization on the SVG work surface.
- Added multi-select foundation using shift-click canvas selection.
- Added keyboard Delete/Backspace support for selected shapes.
- Added grid snap and angle snap controls with session persistence.
- Added viewport zoom, pan, reset, and coordinate display controls.
- Added dynamic shape geometry edit controls in Object Details by selected shape type.
- Kept selection synchronized across canvas, object tiles, JSON Details, and Object Details.
- Preserved schema-gated render behavior with no partial mutation on invalid operations.
- Kept the change scoped to Object Vector Studio V2 runtime, layout, CSS, and targeted Playwright coverage.

## Validation

Playwright impacted: Yes.

Command run:

```powershell
npm run test:workspace-v2
```

Result:

```text
39 passed
```

Additional checks:

```powershell
node --check tools/object-vector-studio-v2/js/ToolStarterApp.js
node --check tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js
node --check tools/object-vector-studio-v2/js/bootstrap.js
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
```

All checks passed.

## Playwright Coverage

The Workspace Manager V2 suite now validates:

- Selection synchronization from canvas to Object Details and JSON Details.
- Multi-select shift-click foundation.
- Move with grid snap, rotate with angle snap, scale, and resize operations.
- Invalid transform rejection without partial mutation.
- Z-order changes through forward/back/front/back controls.
- Duplicate and keyboard delete for shapes.
- Duplicate object behavior.
- Viewport zoom, pan, and reset.
- Selection bounding box, resize handles, and pivot/origin visualization.
- Existing invalid shape payload rejection before render.

Expected pass behavior:

- Valid transform and edit operations mutate only the selected shape/object and log `OK` entries.
- Canvas selection updates Object Details and JSON Details.
- Viewport controls update the SVG viewBox and coordinate/zoom display.

Expected fail behavior:

- Invalid transform values log `FAIL` and leave the prior shape payload unchanged.
- Locked or missing selections log `WARN` and do not mutate payloads.

## V8 Coverage

Required V8 coverage reports:

```text
docs_build/dev/reports/playwright_v8_coverage_report.txt
docs_build/dev/reports/playwright_v8_coverage.txt
docs_build/dev/reports/coverage_changed_js_guardrail.txt
```

Changed runtime JavaScript coverage includes:

```text
(88%) tools/object-vector-studio-v2/js/ToolStarterApp.js
(94%) tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js
(100%) tools/object-vector-studio-v2/js/bootstrap.js
```

The coverage guardrail reported no changed-runtime-JS warnings.

## Full Samples Smoke Test

Skipped. This PR is limited to Object Vector Studio V2 transform/editing runtime behavior and targeted Workspace Manager V2 Playwright coverage. It does not change shared sample loading or broad sample runtime behavior.

## Manual Test Steps

1. Open `tools/object-vector-studio-v2/index.html`.
2. Import a valid payload with `palette.swatches` and `objects[]`.
3. Select an object, create rectangle and circle shapes, and confirm the canvas selection box/handles/pivot appear.
4. Shift-click another shape and confirm multi-select count appears.
5. Move, rotate, scale, resize, and z-order the selected shape and confirm JSON Details updates.
6. Try scale `0` and confirm Status Log shows `FAIL` and the previous transform remains.
7. Duplicate and delete a selected shape, including Delete/Backspace from the canvas.
8. Use zoom, pan, and reset view and confirm the coordinate/zoom display updates.

## Out Of Scope

- Drag-based direct manipulation.
- Full path editing.
- Persistent workspace manifest write-back for Object Vector Studio V2.
- Palette editing.
- World Vector Studio V2 runtime behavior.
- Full samples smoke test.
