# BUILD_PR_STARTER_PROJECT_TEMPLATE

## Scope
- Add one starter project template folder under `templates/`
- Add one shared project manifest that opens through the new shared project system
- Reference existing shared vector, tilemap, parallax, sprite, and palette assets by id/path
- Keep `tools/index.html` tool-only and sample-free
- Keep `Sprite Editor` first-class and `SpriteEditor_old_keep` hidden legacy

## Delivered files
- `templates/starter-project-template/README.md`
- `templates/starter-project-template/config/starter.project.json`
- `scripts/validate-starter-project-template.mjs`
- `docs/dev/reports/starter_project_template_validation.txt`

## Implementation summary
- Added a single starter template project folder with one manifest only
- Reused existing shared content instead of adding duplicated starter assets
- Added explicit shared references for:
  - vector asset
  - tilemap asset
  - parallax asset
  - sprite asset
  - palette asset
- Added per-tool starter payloads so the project opens cleanly through the shared project contract
- Preserved the current active tools surface without adding samples or gameplay content

## Shared references used
- Vector: `templates/vector-native-arcade/assets/vectors/template-player.vector.json`
- Tilemap: `templates/vector-native-arcade/assets/tilemaps/template-arena.tilemap.json`
- Parallax: `templates/vector-native-arcade/assets/parallax/template-backdrop.parallax.json`
- Sprite: `games/Asteroids/platform/assets/sprites/asteroids-demo.sprite.json`
- Palette: `templates/vector-native-arcade/assets/palettes/vector-native-primary.palette.json`

## Validation performed
- `node scripts/validate-tool-registry.mjs`
- `node scripts/validate-active-tools-surface.mjs`
- `node scripts/validate-project-system.mjs`
- `node scripts/validate-starter-project-template.mjs`

## Notes
- This slice adds one reusable starter project only
- No gameplay systems were added
- No samples were added back to `tools/index.html`
