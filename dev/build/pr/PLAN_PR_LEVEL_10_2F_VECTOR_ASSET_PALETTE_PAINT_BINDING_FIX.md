# PLAN_PR_LEVEL_10_2F_VECTOR_ASSET_PALETTE_PAINT_BINDING_FIX

## Purpose
Fix Vector Asset Studio binding when a game manifest palette is loaded but vector paint/stroke selections are not initialized.

## User Finding
Gravity Well shows:
- palette loaded and visible
- Vector Asset Studio:
  - Palette selected: false
  - Paint selected: false
  - Stroke selected: false

## Scope
- Bind Vector Asset Studio paint/stroke state from the shared game palette.
- Ensure vector assets with stroke/fill style select valid palette symbols.
- Strengthen Workspace Manager/Vector Asset Studio test to catch false paint/stroke selection state.
- No start_of_day changes.
