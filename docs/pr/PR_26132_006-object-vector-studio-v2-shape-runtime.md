# PR_26132_006-object-vector-studio-v2-shape-runtime

## Purpose

Add the Object Vector Studio V2 shape runtime foundation without implementing full vector editing.

## Scope

- Added shape/tool creation for rectangle, circle, ellipse, line, polygon, arc, and text primitives.
- Added object-to-shape ownership with per-object shape ordering.
- Added selectable rendered shapes with selected highlight state.
- Added shape visibility, lock, ordering, and type metadata controls in Object Details.
- Added center SVG work surface rendering with explicit render/capture mode logging.
- Added palette swatches that apply color to the selected shape.
- Updated JSON Details to show the selected object and selected shape payload hierarchy.
- Added invalid shape payload validation before render with actionable Status Log failures.
- Finalized Shape/Tools compact icon grid behavior and persisted Words/Icon mode during the session.
- Kept all CSS and JavaScript external.
- Did not add hidden defaults or fallback rendering.

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
node --check tools/object-vector-studio-v2/tests/playwright/FirstClassToolStarter.spec.mjs
git diff --check
```

All checks passed.

## Playwright Coverage

The Workspace Manager V2 suite now validates:

- Primitive creation for rendered Object Vector Studio V2 shapes.
- Shape selection from the SVG work surface.
- Selected shape highlight state and selected shape JSON details.
- Shape visibility toggle behavior.
- Shape lock state logging and JSON synchronization.
- Palette color application to a selected shape.
- Invalid shape payload rejection before render.
- Render/capture mode logging with visible shape counts.
- Shape/Tools icon mode layout and session persistence.

Expected pass behavior:

- A valid palette-backed payload can create and select primitives while preserving object-to-shape ownership.
- Palette swatches update the selected shape style and log the operation.
- Hidden shapes are omitted from the render surface without deleting payload data.
- JSON Details shows selected object and selected shape hierarchy.

Expected fail behavior:

- Missing palette, missing selected object, and invalid shape payloads fail visibly and do not partially render.
- Render failures include the exact shape item and type in Status Log.

## V8 Coverage

Required V8 coverage reports:

```text
docs/dev/reports/playwright_v8_coverage_report.txt
docs/dev/reports/playwright_v8_coverage.txt
docs/dev/reports/coverage_changed_js_guardrail.txt
```

Changed runtime JavaScript coverage includes:

```text
(57%) tools/object-vector-studio-v2/js/controls/StatusLogControl.js
(90%) tools/object-vector-studio-v2/js/ToolStarterApp.js
(93%) tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js
(100%) tools/object-vector-studio-v2/js/bootstrap.js
```

The coverage guardrail reported no changed-runtime-JS warnings.

## Full Samples Smoke Test

Skipped. This PR is limited to Object Vector Studio V2 shape runtime foundation and targeted Workspace Manager V2 Playwright coverage. It does not change shared sample loading or broad sample runtime behavior.

## Manual Test Steps

1. Open `tools/object-vector-studio-v2/index.html`.
2. Import a valid payload with `palette.swatches` and `objects[]`.
3. Select an object tile.
4. Create rectangle, circle, ellipse, line, polygon, arc, and text primitives from Shape/Tools.
5. Select a rendered shape and confirm Object Details and JSON Details update.
6. Apply a palette color and confirm the selected shape style updates.
7. Toggle shape visibility and confirm the rendered shape hides without deleting payload data.
8. Toggle shape lock and confirm Status Log and JSON Details update.
9. Import an invalid shape payload and confirm render is blocked with an actionable `FAIL` log.

## Out Of Scope

- Full vector path editing.
- Drag handles and direct geometry editing on the work surface.
- Persisting changes into Workspace Manager V2 manifests.
- Palette editing.
- World Vector Studio V2 runtime behavior.
- Full samples smoke test.
