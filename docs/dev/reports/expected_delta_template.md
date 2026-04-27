# Expected Codex Return / Delta Template

## Expected Changed Files
- `games/GravityWell/game.manifest.json` if style defaults need adding
- Vector Asset Studio / Workspace Manager binding file(s)
- Runtime test file(s) for Vector Asset Studio binding
- `docs/dev/reports/level_10_2f_vector_asset_palette_paint_binding_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `gravity_well_palette_loaded=true`
- `gravity_well_vector_asset_present=true`
- `gravity_well_vector_palette_selected=true`
- `gravity_well_vector_stroke_selected=true`
- `gravity_well_vector_paint_selected=<true|not-required-fill-false>`
- `binding_test_added_or_updated=true`
- `validators_added=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_2F_VECTOR_ASSET_PALETTE_PAINT_BINDING_FIX_delta.zip`
