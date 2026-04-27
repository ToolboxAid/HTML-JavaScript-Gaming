# BUILD_PR_LEVEL_10_6U_TOOL_UAT_GAP_CLOSURE

## Purpose
Close the remaining Phase 10.6 tool UAT gaps found after PR 10.6T.

## Scope
One stabilization PR for current tool UI readiness failures only.

## User-reported failures to fix

### 1. Asset Browser / Import Hub
Current behavior:
- Browse Approved Assets launched from Shared Tools Surface.
- Category: Vector Assets.
- Search: vector.
- Shows `0 approved assets`.

Required behavior:
- Approved asset browser must show approved vector assets when approved vector assets exist.
- If none exist, it must show a clear valid-empty state explaining which manifest/source was checked.
- It must not silently report zero if the approved asset source was not loaded.

Acceptance:
- Console/readiness report distinguishes:
  - `approved-assets-loaded-empty`
  - `approved-assets-source-missing`
  - `approved-assets-source-wrong-shape`
  - `approved-assets-success`
- UI displays count and source path.

### 2. Primitive Skin Editor samples
Current behavior:
- There are no Primitive Skin Editor samples.

Required behavior:
- Add a couple of Primitive Skin Editor sample entries using the existing samples structure and naming conventions.
- Keep scope small: enough to verify launch/data/control readiness only.
- Update sample index only as required.

Acceptance:
- At least two Primitive Skin Editor samples exist and launch from samples.
- Each sample has explicit manifest/input files.
- No hidden default/fallback sample data.

### 3. Sample 0219 sprite-editor expectation clarity
Current behavior:
- Sample 0219 sprite-editor plays.
- The sample itself does not animate and does not show the expected white square on colored larger square.

Required behavior:
- Determine whether 0219 is supposed to be static or animated.
- If static, UI/report must clearly label it static and not imply animation playback is expected.
- If animated, fix the sample/tool binding so the expected white square on colored larger square appears/animates.

Acceptance:
- Report documents expected behavior for 0219.
- UI does not look broken or contradictory.
- If animation is expected, animation visibly uses loaded sample data.

### 4. State Inspector input behavior
Current behavior:
- State Inspector loads.
- Refresh snapshot works.
- Inspect JSON fails with `Input JSON is invalid. Paste valid JSON to inspect.`
- JSON Input is blank while Inspection Snapshot is populated.

Required behavior:
- State Inspector must clarify the difference between snapshot inspection and pasted JSON inspection.
- If snapshot exists and JSON input is blank, Inspect JSON must not imply the snapshot is invalid.
- Either populate JSON Input from the snapshot by default, or rename/disable the manual Inspect JSON action until valid manual JSON exists.

Acceptance:
- Blank manual JSON input does not produce a misleading error when snapshot data exists.
- UI has a clear default state.
- Diagnostics identify `manual-json-empty` separately from `invalid-json`.

### 5. Vector Asset Studio palette/paint/stroke controls
Current behavior:
- Still shows `Palette selected: false`, `Paint selected: false`, `Stroke selected: false` for 0901, 1204, 1208.
- For 1215-1217, Paint + Stroke swatches look grayed out/overlayed.
- Swatches and used colors seem grayed out.

Required behavior:
- If palette data is loaded, palette controls must be enabled and visibly active.
- First valid palette swatch must be selected by default when no explicit selection exists.
- Paint and stroke controls must default to valid loaded palette swatches or show a clear required-selection state.
- Disabled/overlay styling must only be used when controls are truly unavailable, and diagnostics must explain why.

Acceptance:
- For 0901, 1204, 1208, 1215, 1216, 1217:
  - Palette selected = true when palette exists.
  - Paint selected = true when paint swatch exists or default applied from palette.
  - Stroke selected = true when stroke swatch exists or default applied from palette.
  - No grayed/overlay state for active controls.
- Report lists each tested sample and final control readiness classification.

### 6. Vector Map Editor default object selection
Current behavior:
- Objects list appears.
- Canvas can show once user selects first object.
- Tool still does not default to first object.
- UI does not indicate which object is selected.

Required behavior:
- When objects exist and no object is selected, select the first object by default after load.
- Canvas must render the selected/default object without requiring a user click.
- Objects list must visibly indicate selected object.
- Selection details panel/status must identify selected object.

Acceptance:
- Vector Map Editor opens with first object selected by default.
- Canvas is not blank when objects exist.
- Selected item is visibly highlighted/marked.
- Diagnostics show `default-selection-applied: true` when applicable.

## Non-goals
- Do not refactor all tools.
- Do not add fallback/demo data.
- Do not modify start_of_day folders.
- Do not rewrite roadmap content except status marker updates if execution-backed.

## Required validation commands
Run the repo's relevant fast validation commands, including:

```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

Also perform targeted sample/tool checks for:
- Asset Browser approved vector assets
- Primitive Skin Editor new samples
- Sample 0219 sprite-editor
- State Inspector
- Vector Asset Studio 0901, 1204, 1208, 1215, 1216, 1217
- Vector Map Editor samples with objects

## Required reports
Write:

```text
docs/dev/reports/PR_10_6U_tool_uat_gap_closure_report.md
```

The report must include pass/fail evidence for every acceptance item above.
