# BUILD_PR_LEVEL_10_6Q_TOOL_UI_READINESS_DOD_COMPLETION

## Purpose
Complete the Tool UI Readiness Definition of Done before additional UAT bug-picking.

This PR is docs-first and does not implement runtime code. Codex must inspect the current tools and complete the DoD so future stabilization work has a mechanical success target.

## Scope
- Add/complete per-tool required input checklist.
- Add/complete per-tool required UI control checklist.
- Add/complete per-tool lifecycle/timer checklist.
- Add/complete expected diagnostic signals.
- Produce a Codex gap report listing missing fields, controls, bindings, timer behaviors, and tool-specific acceptance checks.

## Current UAT signals to encode in DoD
Codex must include these as explicit DoD requirements and audit targets:

1. All tools: accordions must not auto-close because of a timer/lifecycle bug.
2. Asset Browser / Import Hub: approved assets count must reflect loaded data; `0 approved assets` is a failure unless the manifest intentionally has zero approved assets.
3. Tilemap Studio: map must be loaded; tile palette and selected tile readiness must be proven.
4. Vector Asset Studio: palette, paint, and stroke controls must be loaded/bound. Samples 1215, 1216, 1217 load SVG Background Canvas but must also load required palette/control data.
5. Vector Map Editor: data must be loaded. Samples 1212, 1213, 1214 are known working references.

## Required DoD model
A tool is not ready when files are merely fetched. A tool is ready only when:

```text
manifest input loaded
required data fetched
required data shape validated
required UI controls populated
visible controls prove they consumed loaded data
lifecycle/timer behavior is stable
safe empty/error state exists for missing required data
diagnostics classify every required input/control
```

## Required classification values
Codex must make the DoD require these classifications for both data loads and controls:

```text
success
missing
wrong-path
wrong-shape
empty
defaulted
lifecycle-failure
```

## Required diagnostic families
Codex must include these diagnostic categories in the DoD:

```text
[tool-load:request]
[tool-load:fetch]
[tool-load:loaded]
[tool-load:classification]
[tool-ui:control-ready]
[tool-ui:lifecycle]
[tool-ui:final-ready]
```

## Per-tool minimum DoD inventory
Codex must verify, correct, and extend this list using the actual repo tools.

### Sprite Editor
Required inputs:
- sprite project json
- canonical palette json

Required controls:
- palette grid
- Color 1 selector
- Color 2 selector
- active drawing color
- sprite canvas
- sprite/frame list
- draw/erase/tool mode buttons
- save/export controls

Success:
- palette grid populated from canonical palette
- Color 1 is first valid palette swatch
- Color 2 is second valid palette swatch
- active drawing color matches Color 1
- canvas renders loaded sprite/project
- sprite/frame list populated from loaded project

### Palette Browser
Required inputs:
- canonical palette json only

Required controls:
- palette title/name
- swatch grid
- selected swatch detail
- copy/export controls

Success:
- no `*.palette-browser.json` duplicate contract is required
- swatches come from canonical `*.palette.json`

### Asset Browser / Import Hub
Required inputs:
- asset manifest/list
- approval/status metadata if the UI displays approved counts
- referenced asset files or preview metadata when required

Required controls:
- asset count summary
- approved assets count
- asset grid/list
- filters/search
- selected asset detail
- import/open actions

Success:
- approved count is derived from loaded data
- `0 approved assets` is only success when source data actually has zero approved assets
- grid/list count matches loaded assets
- selected detail binds to a real loaded asset

### Tilemap Studio
Required inputs:
- tilemap json
- tileset/sprite asset json
- canonical palette json when colorized

Required controls:
- map canvas
- tile palette/grid
- selected tile
- layer list
- map dimensions/status
- save/export controls

Success:
- map canvas renders loaded tilemap
- tile palette populated from loaded tileset
- selected tile defaults to first valid loaded tile
- layers and dimensions reflect loaded map

### Vector Asset Studio
Required inputs:
- vector asset json or SVG/source asset
- canonical palette json when paint/stroke controls exist

Required controls:
- asset preview/background canvas
- shape/path list
- selected shape editor
- palette control
- paint/fill control
- stroke control
- transform controls
- save/export controls

Success:
- preview canvas is not enough by itself
- palette control is bound when declared/required
- paint and stroke controls are bound to loaded palette/style data
- samples 1215, 1216, 1217 must not report ready unless palette/paint/stroke are ready

### Vector Map Editor
Required inputs:
- vector map json
- canonical palette json when colorized

Required controls:
- map canvas
- layer/entity list
- selected entity panel
- color controls when used
- zoom/pan controls
- save/export controls

Success:
- data load is proven before ready
- layer/entity list populated
- selected entity panel binds real data
- samples 1212, 1213, 1214 can be used as known-good comparison references

### Replay / Event Tool
Required inputs:
- events json

Required controls:
- event list
- timeline/scrubber
- play/pause
- current event display
- speed control
- status/result panel

Success:
- events array exists and is populated when replay expected
- timeline range matches events
- playback consumes loaded events only

### Manifest / Data Flow Inspector
Required inputs:
- manifest json
- declared tool paths
- loaded tool data

Required controls:
- manifest summary
- declared paths table
- fetch results table
- expected vs actual table
- classification/status panel

Success:
- does not normalize away missing or wrong-shape data
- shows every required fetch and control readiness state

### Workspace Manager / Launchers
Required inputs:
- game/sample manifest
- declared tool id
- required input paths

Required controls:
- title/identity
- tool launch buttons
- required input summary
- status/error panel
- validation indicator

Success:
- launchers pass manifest-declared inputs only
- no hidden fallback data
- no hardcoded sample asset paths

### Accordion / Lifecycle controls for all tools
Required behavior:
- opening an accordion must persist until user action or documented navigation changes it
- no timer may close user-opened panels after approximately one second
- diagnostics must report timer/lifecycle ownership for any auto-close behavior

Failure:
- any accordion auto-closes without user action
- lifecycle/timer code changes UI state after readiness without a documented reason

## Codex tasks
1. Inspect actual tool files only as needed; do not do repo-wide scanning beyond locating tool entry points and related UI files.
2. Update the DoD document/report with any missing fields, controls, input contracts, lifecycle checks, or acceptance checks.
3. Produce a report at `docs/dev/reports/level_10_6Q_tool_ui_readiness_dod_completion_report.md`.
4. Do not implement code fixes in this PR.
5. Do not delete or rewrite roadmap content. If roadmap status is changed, only change status markers.

## Acceptance
- DoD includes every known tool category.
- DoD includes per-tool required inputs.
- DoD includes per-tool required UI controls.
- DoD includes lifecycle/timer stability requirements.
- DoD asks Codex to explicitly report missed fields/controls/checks.
- User should not UAT yet unless the report says the DoD is complete and ready for implementation PRs.

## Execution Output (Docs-Only)
- Update `docs/dev/dod/tool_ui_readiness_dod.md` in-place to close remaining DoD completion gaps found by file-backed audit.
- Write `docs/dev/reports/level_10_6Q_tool_ui_readiness_dod_completion_report.md` with explicit missed/mapped checks and UAT readiness decision.
- No runtime implementation changes in this PR.
