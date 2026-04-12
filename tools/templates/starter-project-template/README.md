# Starter Project Template

This template is a single reusable project manifest for the shared tools project system.

## Purpose
- prove cross-tool open/save/reload compatibility
- keep assets and palettes referenced by shared ids and paths
- avoid introducing gameplay systems or sample cards

## Open flow
1. Open any active first-class tool.
2. Use the shared shell `Open Project` action.
3. Select `tools/templates/starter-project-template/config/starter.project.json`.

## Shared references used
- vector: `templates/vector-native-arcade/assets/vectors/template-player.vector.json`
- tilemap: `templates/vector-native-arcade/assets/tilemaps/template-arena.tilemap.json`
- parallax: `templates/vector-native-arcade/assets/parallax/template-backdrop.parallax.json`
- sprite: `games/Asteroids/platform/assets/sprites/asteroids-demo.sprite.json`
- palette: `templates/vector-native-arcade/assets/palettes/vector-native-primary.palette.json`

## Notes
- `Sprite Editor` remains first-class.
- `SpriteEditor_old_keep` remains legacy and hidden.
- `tools/index.html` remains tool-only and sample-free.
