# PR 10.6V — Final Tool UI DoD Enforcement

## Purpose
Finish the DoD stabilization lane before UAT by enforcing default selection, control enablement, selected-state visibility, lifecycle/timer stability, and clear empty-state behavior across tools.

## Scope
- Tool UI readiness only.
- No broad refactors.
- No silent fallback/demo data.
- No hardcoded sample paths.
- Manifest-declared data remains the source of truth.

## Required Fix Areas

### 1. Global selectable-control rule
Every tool with selectable loaded data must auto-select the first valid item after successful load unless the user already selected something.

Required:
- first valid object/item/layer/swatch/tile/asset is selected after load
- selected item has visible UI indication
- details panel/canvas/controls bind to selected item
- no tool appears empty when valid data exists

### 2. Global control enablement rule
Required controls must become enabled after their required data is loaded and validated.

Required:
- palette controls enabled after palette load
- paint/stroke controls enabled after palette + selection state exist
- tile controls enabled after tileset load
- object controls enabled after vector map/object selection
- controls must not remain gray/disabled when valid data exists

### 3. Global lifecycle/timer rule
UI state must not change after load unless user-triggered or explicitly documented.

Required:
- remove accidental auto-close timers
- accordion panels must stay open after user opens them
- no delayed reset after successful load
- no reinitialization overwriting selected state
- no setTimeout/debounce side effect that clears ready UI

### 4. Empty-state rule
Tools with no data must show a safe, explicit empty state. Tools with valid data must not show empty state.

Required:
- Asset Browser with zero approved assets must clearly say whether no approved assets are currently registered
- no fake/generated approved assets unless explicitly manifest-declared sample data is added
- empty state must not look like failed loading

## Tool-specific Acceptance

### Vector Asset Studio
Fix remaining UAT issue:
- palette visible and active
- paint swatch active
- stroke swatch active
- Palette selected: true when palette loaded
- Paint selected: true when a paint swatch is available
- Stroke selected: true when a stroke swatch is available
- samples 0901, 1204, 1208, 1215, 1216, 1217 must not leave controls gray/overlay-disabled when valid palette/color data exists

### Vector Map Editor
Fix remaining UAT issue:
- objects list populated
- first object auto-selected by default
- selected object visibly indicated in list
- canvas renders selected object immediately after load
- selected object name/id shown in UI

### Asset Browser / Import Hub
- If approved assets are intentionally empty, show a clear valid empty state.
- If vector assets are expected, load approved vector assets from manifest/registry source.
- Do not silently fabricate assets.

### State Inspector
- If inspection snapshot exists and JSON input is empty, either preload snapshot into input or show helper text explaining Refresh Snapshot vs Inspect JSON.
- Do not show an invalid JSON error on initial blank input unless user attempted inspection.

### Sprite Editor sample 0219
- Document expected behavior for sample 0219.
- If sample is supposed to animate, add/repair explicit animation data.
- If not supposed to animate, UI/report must not imply animation is expected.
- Visible sample expectation must be clear: whether white square on colored larger square should render in sample view or tool view.

## Required Diagnostics
Codex must keep or add diagnostics sufficient to prove:
- required inputs loaded
- required controls bound
- first selection applied
- controls enabled
- lifecycle did not reset state
- empty state is intentional when shown

Required classification values:
- success
- missing
- wrong-path
- wrong-shape
- empty
- defaulted
- disabled
- unselected
- lifecycle-reset

## Acceptance Commands
Run:

```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

If available, also run or update focused checks for tool UI readiness.

## Required Reports
Create or update:
- docs/dev/reports/PR_10_6V_final_dod_validation.md
- docs/dev/reports/PR_10_6V_remaining_uat_gate.md

## UAT Gate
Do not mark UAT ready unless reports show:
- 0 missing required controls
- 0 disabled controls when valid data exists
- 0 missing default selections when selectable data exists
- 0 lifecycle/timer resets
- 0 unclear empty states
