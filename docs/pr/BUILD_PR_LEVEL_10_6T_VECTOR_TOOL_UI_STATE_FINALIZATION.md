# BUILD_PR_LEVEL_10_6T_VECTOR_TOOL_UI_STATE_FINALIZATION

## Purpose
Close the remaining Vector tool UI readiness failures found after PR 10.6S.

## Scope
One PR purpose only: finalize Vector Asset Studio and Vector Map Editor UI control readiness after data load.

## User UAT Evidence
- Vector Asset Studio: samples 1215, 1216, 1217 show vector content, but palette + paint + stroke controls are not working. Swatches and used colors appear grayed out.
- Vector Map Editor: objects are loaded, but canvas initially appears empty until the first object is manually selected. The tool should default-select the first object and clearly indicate the selected object.

## Required Fixes

### 1. Vector Asset Studio
Codex must inspect the actual Vector Asset Studio controls and data flow, then fix the smallest required code path so:

- palette controls enable only after canonical palette data is loaded and valid
- swatches are populated and interactive when palette data exists
- used colors are populated and interactive when asset colors exist
- paint/fill control is enabled and bound to the selected vector element or current paint target
- stroke control is enabled and bound to the selected vector element or current stroke target
- disabled/gray state is only used when a required dependency is truly missing
- no hidden fallback palette or hardcoded default palette is introduced
- no broad refactor or unrelated tool changes

Required diagnostics after fix:

```text
[tool-ui:control-ready]
toolId: vector-asset-studio
controlId: palette-swatches
classification: success
```

```text
[tool-ui:control-ready]
toolId: vector-asset-studio
controlId: used-colors
classification: success
```

```text
[tool-ui:control-ready]
toolId: vector-asset-studio
controlId: paint-control
classification: success
```

```text
[tool-ui:control-ready]
toolId: vector-asset-studio
controlId: stroke-control
classification: success
```

### 2. Vector Map Editor
Codex must inspect the actual Vector Map Editor object/canvas state, then fix the smallest required code path so:

- when objects are loaded and no object is selected, the first valid object is selected automatically
- the selected object is rendered on the canvas immediately after load
- the object list visibly marks the selected object
- the selected object detail/status panel identifies the selected object
- changing selection updates canvas and selected-object indication
- if no objects exist, show a safe empty state instead of fake/default objects
- no broad refactor or unrelated tool changes

Required diagnostics after fix:

```text
[tool-ui:control-ready]
toolId: vector-map-editor
controlId: object-list
classification: success
```

```text
[tool-ui:control-ready]
toolId: vector-map-editor
controlId: selected-object
classification: success
```

```text
[tool-ui:control-ready]
toolId: vector-map-editor
controlId: canvas-render
classification: success
```

## Acceptance Tests
Run:

```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

Manual smoke checks:

```text
samples 1215, 1216, 1217:
- Vector Asset Studio renders vector content
- palette swatches are not grayed out when palette exists
- used colors are not grayed out when asset colors exist
- paint and stroke controls work
```

```text
Vector Map Editor:
- objects are visible in object list
- first object is selected by default
- canvas renders selected object immediately
- selected object is visually indicated in list/status/details
```

## Report Required
Write:

```text
docs/dev/reports/PR_10_6T_vector_tool_ui_state_finalization_report.md
```

Report must include:

- files changed
- controls fixed
- before/after readiness classification
- test results
- remaining gaps, if any

## Roadmap
Only update roadmap status markers if execution-backed. Do not rewrite roadmap text.
