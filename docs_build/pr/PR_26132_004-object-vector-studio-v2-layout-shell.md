# PR_26132_004-object-vector-studio-v2-layout-shell

## Purpose

Build the Object Vector Studio V2 layout shell without implementing full object editing.

## Scope

- Added the Object Vector Studio V2 workspace nav with Return to Workspace.
- Added the standalone tool nav with Import, Copy JSON, and Export actions.
- Replaced the copied template content with the requested left, center, and right layout shell.
- Added left column accordions for Object, Shape/Tools, and Objects.
- Added right column accordions for Palette, Object Details, JSON Details, and Status Log.
- Added equal accordion space sharing, collapsed-state height adjustment, and scrollable control content.
- Added placeholder object tiles and shape/tool icon/text toggle buttons.
- Added schema-only payload loading foundation that requires a palette before rendering.
- Preserved Object Vector Studio V2 scope only. World Vector Studio V2 was not modified.

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
node --check tools/object-vector-studio-v2/js/bootstrap.js
node --check tools/object-vector-studio-v2/js/ToolStarterApp.js
node --check tools/object-vector-studio-v2/js/controls/ActionNavControl.js
node --check tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js
node --check tools/object-vector-studio-v2/tests/playwright/FirstClassToolStarter.spec.mjs
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
git diff --check
```

All checks passed.

## Playwright Coverage

The Workspace Manager V2 suite now validates:

- Object Vector Studio V2 launch from the tools surface.
- Tool nav actions for Import, Copy JSON, and Export.
- Workspace launch nav with Return to Workspace and preserved `hostContextId`.
- Requested left and right accordion shell labels.
- Schema-only palette gate and invalid payload rejection before render.
- Valid palette-backed payload render into object tiles, selected object details, JSON details, and status log.
- Shape/tool toggle state and status logging.
- Equal accordion space sharing and collapsed-state adjustment.
- Scrollable object tile content.
- Hide Header and Details fullscreen-style layout with side columns and filled center work area.

Expected pass behavior:

- A palette-backed Object Vector Studio V2 payload renders shell details and enables JSON actions.
- A payload missing `palette` fails visibly and leaves the empty state rendered.
- Workspace launch shows Return to Workspace only.

Expected fail behavior:

- Missing palette, invalid JSON, or missing workspace toolState data is rejected before render and logged as actionable status.

## V8 Coverage

The required Playwright V8 coverage report was produced at:

```text
docs_build/dev/reports/playwright_v8_coverage_report.txt
```

Changed runtime JavaScript coverage includes:

```text
(86%) tools/object-vector-studio-v2/js/ToolStarterApp.js
(91%) tools/object-vector-studio-v2/js/controls/ActionNavControl.js
(92%) tools/object-vector-studio-v2/js/controls/ToolStarterShellControl.js
(100%) tools/object-vector-studio-v2/js/bootstrap.js
(100%) tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js
```

Guardrail:

```text
docs_build/dev/reports/coverage_changed_js_guardrail.txt
```

No changed-runtime-JS warnings were reported.

## Full Samples Smoke Test

Skipped. This PR is limited to Object Vector Studio V2 layout shell behavior and targeted Workspace Manager V2 launch/layout coverage. It does not modify shared sample loading or broad sample runtime behavior.

## Manual Test Steps

1. Open `tools/object-vector-studio-v2/index.html`.
2. Confirm the header shows Object Vector Studio V2 and the standalone nav shows Import, Copy JSON, Export.
3. Confirm left accordions are Object, Shape/Tools, Objects.
4. Confirm right accordions are Palette, Object Details, JSON Details, Status Log.
5. Import JSON without `palette` and confirm it is rejected before render.
6. Import JSON with `palette.swatches` and `objects[]` containing `id` and `name`, then confirm object tiles render and JSON actions enable.
7. Launch with `?launch=workspace&fromTool=workspace-manager-v2&hostContextId=manual-check` and confirm Return to Workspace appears.

## Out Of Scope

- Full vector object editing.
- Shape editing, path editing, animation structures, and palette editing.
- World Vector Studio V2 runtime behavior.
- Full samples smoke test.
