# Starter Project Template

This template is a single reusable project manifest for the shared tools project system.

## Purpose
- prove cross-tool open/save/reload compatibility
- keep assets and palettes referenced by shared ids and paths
- avoid introducing gameplay systems or sample cards

## Open flow
1. Open any active first-class tool.
2. Use the shared shell `Open Project` action.
3. Select `tools/_templates-v2/starter-project-template/config/starter.project.json`.

## Shared references used
- vector: `tools/_templates-v2/vector-native-arcade/assets/vectors/template-player.vector.json`
- tilemap: `tools/_templates-v2/vector-native-arcade/assets/tilemaps/template-arena.tilemap.json`
- parallax: `tools/_templates-v2/vector-native-arcade/assets/parallax/template-backdrop.parallax.json`
- sprite: `games/Asteroids/game.manifest.json#tools.sprite-editor.sprites.sprite.asteroids.demo.runtime`
- palette: `tools/_templates-v2/vector-native-arcade/assets/palettes/vector-native-primary.palette.json`

## Notes
- `Sprite Editor` remains first-class.
- `SpriteEditor_old_keep` remains legacy and hidden.
- `tools/index.html` remains tool-only and sample-free.

