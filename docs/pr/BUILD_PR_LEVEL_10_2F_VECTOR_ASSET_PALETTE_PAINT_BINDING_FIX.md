# BUILD_PR_LEVEL_10_2F_VECTOR_ASSET_PALETTE_PAINT_BINDING_FIX

## Objective
When a game workspace opens with a shared palette and vector assets, Vector Asset Studio must show a valid palette/paint/stroke selection state.

## Current Failure
Gravity Well:
- shared palette loads
- vector asset is visible
- Vector Asset Studio reports:
  - `Palette selected: false`
  - `Paint selected: false`
  - `Stroke selected: false`

This means palette binding is not reaching vector style selection.

## Required Behavior
For any game with:

```json
tools["palette-browser"].palette.swatches
```

and:

```json
tools["vector-asset-studio"].vectors
```

Vector Asset Studio must:
1. detect shared palette
2. select a palette
3. select a valid paint/fill swatch when fill is enabled
4. select a valid stroke swatch when stroke is enabled
5. not show false selection state when valid defaults exist

## Manifest Style Rule
Vector assets should have explicit style fields that can bind to palette swatches:

Preferred:

```json
"style": {
  "stroke": true,
  "fill": false,
  "strokeSymbol": "1",
  "fillSymbol": "0"
}
```

or equivalent existing schema field names.

If a vector has `stroke: true` but no `strokeSymbol`, Codex may assign a default visible palette symbol from the game palette.

If `fill: false`, `fillSymbol` may be omitted, but UI should not report "paint selected false" as an error unless fill is required.

## Gravity Well Fix
For Gravity Well:
- ensure ship vector has valid style selection
- ensure stroke selection is bound
- ensure palette selected state becomes true
- paint/fill behavior should match style fill setting

## Test Update
Update/add a test so this case fails if:
- shared palette exists
- vector assets exist
- Vector Asset Studio reports palette selected false
- stroke-enabled vector reports stroke selected false

Suggested report/test:
- update `GamesIndexWorkspaceManagerOpen.test.mjs`
- or add focused `WorkspaceManagerVectorAssetBinding.test.mjs`

## Required Report
Create:

```text
docs/dev/reports/level_10_2f_vector_asset_palette_paint_binding_report.md
```

Report per affected game:
- shared palette loaded
- vector count
- selected vector id
- palette selected
- paint/fill selected status
- stroke selected status
- defaults added

## Acceptance
- Gravity Well Vector Asset Studio shows palette selected true.
- Gravity Well stroke selected true for stroke-enabled ship vector.
- Paint selected is true only when fill is enabled/required, otherwise report explains fill=false.
- Test catches palette loaded but vector paint/stroke unbound.
- No validators added.
- No start_of_day changes.
