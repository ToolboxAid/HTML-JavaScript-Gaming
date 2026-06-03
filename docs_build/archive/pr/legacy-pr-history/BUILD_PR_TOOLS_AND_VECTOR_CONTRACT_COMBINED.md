# BUILD_PR_TOOLS_AND_VECTOR_CONTRACT_COMBINED

## Goal
In one pass:
- consolidate duplicated and renamed tool folders under `toolbox/`
- repair affected references and loading paths
- validate tool, sample, and asset loading paths
- produce the vector asset contract planning/spec outputs

## Canonical Tool Folders Selected
- `toolbox/Sprite Editor/`
- `toolbox/Tilemap Studio/`
- `toolbox/Parallax Scene Studio/`
- `toolbox/Vector Asset Studio/`
- `toolbox/Vector Map Editor/`
- `toolbox/shared/`

## Duplicate Folders Discovered
- `toolbox/Sprite Editor/`
- `toolbox/Tile Map Editor/`
- `toolbox/Parallax Editor/`
- `toolbox/SVG Background Editor/`
- `toolbox/Pixel Asset Studio/`
- `toolbox/SpriteEditorV3/`
- `toolbox/VectorMapEditor/`

## Files And Folders Moved Or Merged
### Sprite Tool
- active isolated sprite editor finalized at `toolbox/Sprite Editor/`
- retained `index.html`, `main.js`, `spriteEditor.css`, `README.md`, and `modules/`
- removed duplicate `toolbox/Pixel Asset Studio/`
- renamed compact `toolbox/SpriteEditorV3/` path to `toolbox/Sprite Editor/`

### Tilemap Tool
- retained the canonical implementation in `toolbox/Tilemap Studio/`
- kept `index.html`, `main.js`, `tileMapEditor.css`, `README.md`, and `samples/`

### Parallax Tool
- retained the canonical implementation in `toolbox/Parallax Scene Studio/`
- kept `index.html`, `main.js`, `parallaxEditor.css`, `README.md`, and `samples/`

### SVG And Vector Tooling
- retained the canonical implementation in `toolbox/Vector Asset Studio/`
- kept `index.html`, `main.js`, `svgBackgroundEditor.css`, `README.md`, and `samples/`
- renamed `toolbox/VectorMapEditor/` to `toolbox/Vector Map Editor/`
- kept `index.html`, `main.js`, `vectorMapEditor.css`, `README.md`, `how_to_use.html`, `assets/`, and `editor/`

## References Updated
- `toolbox/index.html` now points to:
  - `toolbox/Sprite Editor/`
  - `toolbox/Tilemap Studio/`
  - `toolbox/Parallax Scene Studio/`
  - `toolbox/Vector Asset Studio/`
  - `toolbox/Vector Map Editor/`
- active docs and report paths now use:
  - `toolbox/Sprite Editor/`
  - `toolbox/Vector Map Editor/`
- vector-map help/example references were updated to the spaced canonical folder name
- active loading-surface scans show no required refs to deprecated duplicate folders

## Obsolete Folders Removed
- `toolbox/Sprite Editor/`
- `toolbox/Tile Map Editor/`
- `toolbox/Parallax Editor/`
- `toolbox/SVG Background Editor/`
- `toolbox/Pixel Asset Studio/`
- `toolbox/SpriteEditorV3/`
- `toolbox/VectorMapEditor/`

## Explicit Legacy Exclusion
Old `toolbox/SpriteEditor_old_keep/` was intentionally excluded except for active reference cleanup.
- no merge work was performed from the legacy folder
- no compatibility work was added for the legacy folder
- active platform paths were redirected to `toolbox/Sprite Editor/`

## Validation Summary
- verified launcher/index links resolve through canonical tool folders
- verified sprite, tilemap, parallax, vector asset studio, and vector map editor entry files exist
- verified sample-manifest paths for:
  - `toolbox/Tilemap Studio/samples/sample-manifest.json`
  - `toolbox/Parallax Scene Studio/samples/sample-manifest.json`
  - `toolbox/Vector Asset Studio/samples/sample-manifest.json`
- ran `node --check` on:
  - `toolbox/Sprite Editor/main.js`
  - `toolbox/Sprite Editor/modules/spriteEditorApp.js`
  - `toolbox/Sprite Editor/modules/projectModel.js`
  - `toolbox/Sprite Editor/modules/constants.js`
  - `toolbox/Tilemap Studio/main.js`
  - `toolbox/Parallax Scene Studio/main.js`
  - `toolbox/Vector Asset Studio/main.js`
  - `toolbox/Vector Map Editor/main.js`
  - `toolbox/Vector Map Editor/editor/VectorMapEditorApp.js`
- confirmed no required refs remain to deprecated duplicate folders in `toolbox/`, `games/`, `tests/`, or `scripts/`
- confirmed no required runtime refs remain to old `SpriteEditor` in `toolbox/`, `games/`, `tests/`, or `scripts/`

## Vector Asset Contract Outputs
- planning/build workflow documented through the combined repo docs bundle
- canonical spec produced at `docs/reference/architecture-standards/specs/vector_asset_contract.md`
- contract output covers:
  - purpose and scope
  - canonical vector asset file role
  - coordinate system
  - origin conventions
  - transform expectations
  - stroke behavior
  - fill and color rules
  - palette strategy
  - supported shape primitives
  - layering expectations
  - naming conventions
  - runtime expectations
  - future geometry runtime support expectations
  - explicit non-goals
