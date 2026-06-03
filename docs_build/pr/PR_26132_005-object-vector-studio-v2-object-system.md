# PR_26132_005-object-vector-studio-v2-object-system

## Purpose

Add the Object Vector Studio V2 object management foundation without implementing full vector editing.

## Scope

- Added Object accordion controls for Add, Rename, Delete, Flatten, and Object Name.
- Added selectable object tiles with visible selected state and synchronized object count/name/details.
- Added object type metadata foundation for details rendering by object type.
- Changed JSON Details to show the active selected object JSON only, read-only.
- Added schema validation before every payload render and object mutation.
- Invalid payloads and blocked object actions are rejected visibly through Status Log.
- Added Shape/Tools icon buttons with icon/text and compact icon display mode.
- Kept all CSS and JavaScript external.
- Did not add hidden default payloads or fallback objects.

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
node --check toolbox/object-vector-studio-v2/js/ToolStarterApp.js
node --check toolbox/object-vector-studio-v2/js/bootstrap.js
node --check toolbox/object-vector-studio-v2/js/controls/StatusLogControl.js
node --check toolbox/object-vector-studio-v2/tests/playwright/FirstClassToolStarter.spec.mjs
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
git diff --check
```

All checks passed.

## Playwright Coverage

The Workspace Manager V2 suite now validates:

- Object Add is blocked without a schema-valid palette-backed payload.
- Invalid payloads are rejected before render and leave JSON Details at `{}`.
- Valid payloads render object tiles, selected state, object count, details, and active object JSON.
- Select, Rename, Add, Flatten, and Delete synchronize object tiles, details, selected state, and JSON Details.
- Shape/Tools icon/text toggle and compact icon mode update correctly.
- Status Log emits actionable `OK` and `FAIL` lines for object and schema actions.

Expected pass behavior:

- A valid palette-backed payload can add, select, rename, flatten, and delete objects while remaining schema-valid.
- JSON Details shows only the selected object.
- Object details use the selected object type metadata framework.

Expected fail behavior:

- Missing palette and object actions without a valid payload fail visibly and do not partially render.

## V8 Coverage

Required V8 coverage reports:

```text
docs_build/dev/reports/playwright_v8_coverage_report.txt
docs_build/dev/reports/playwright_v8_coverage.txt
docs_build/dev/reports/coverage_changed_js_guardrail.txt
```

Changed runtime JavaScript coverage includes:

```text
(57%) toolbox/object-vector-studio-v2/js/controls/StatusLogControl.js
(91%) toolbox/object-vector-studio-v2/js/controls/ActionNavControl.js
(92%) toolbox/object-vector-studio-v2/js/controls/ToolStarterShellControl.js
(93%) toolbox/object-vector-studio-v2/js/ToolStarterApp.js
(100%) toolbox/object-vector-studio-v2/js/bootstrap.js
(100%) toolbox/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js
```

The coverage guardrail reported no changed-runtime-JS warnings.

## Full Samples Smoke Test

Skipped. This PR is limited to Object Vector Studio V2 object management foundation and targeted Workspace Manager V2 Playwright coverage. It does not change shared sample loading or broad sample runtime behavior.

## Manual Test Steps

1. Open `toolbox/object-vector-studio-v2/index.html`.
2. Try Add with an object name before importing JSON and confirm Status Log shows a `FAIL` message.
3. Import invalid JSON missing `palette` and confirm no object tiles render.
4. Import valid JSON with `palette.swatches` and `objects[]`.
5. Select an object tile and confirm Object Name, Object Details, selected state, and JSON Details update.
6. Rename the selected object and confirm the tile and JSON Details update.
7. Add a new object and confirm the object count increases and the new tile is selected.
8. Flatten the selected object and confirm the active object JSON includes flatten metadata.
9. Delete the selected object and confirm the object list/count/details stay synchronized.

## Out Of Scope

- Full object editing.
- Shape/path editing.
- Persisting changes into Workspace Manager V2 manifests.
- Palette editing.
- Full samples smoke test.
