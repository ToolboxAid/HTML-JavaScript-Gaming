# PLAN_PR_LEVEL_10_2D_GRAVITY_WELL_SHIP_VECTOR_MAP_FIX

## Purpose
Fix Gravity Well manifest payload completeness: the ship vector map is missing.

## Scope
- Add/restore Gravity Well ship vector map data into `games/GravityWell/game.manifest.json`.
- Place actual vector JSON under `tools["vector-asset-studio"].vectors`.
- Strengthen payload expectation tests so required game vectors are detected.
- No separate vector JSON file.
- No start_of_day changes.
