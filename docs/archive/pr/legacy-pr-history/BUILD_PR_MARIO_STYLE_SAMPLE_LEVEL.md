# BUILD_PR_MARIO_STYLE_SAMPLE_LEVEL

## Goal
Add a Mario-style learning sample level for both editor tools as a docs-plus-samples delta.

## Scope
- Tile authoring sample under `tools/Tilemap Studio/samples/`
- Parallax authoring sample under `tools/Parallax Scene Studio/samples/`
- Shared level concept between both samples:
  - Tile sample focuses gameplay structure (terrain, jumps, hazards, markers, progression)
  - Parallax sample focuses visual depth (background layering, hero-space proxy, foreground occlusion)

## Deliverables
- `tools/Tilemap Studio/samples/mario_style_learning_level_tilemap.json`
- `tools/Parallax Scene Studio/samples/mario_style_learning_level_parallax.json`
- Manifest updates in both sample directories so fallback manifest-based loading includes the Mario sample.
- Dev reports in `docs/dev/reports/`.

## Constraints
- No engine core API modifications.
- Keep samples local to each tool.
- Use public sample data schemas already consumed by each editor.
