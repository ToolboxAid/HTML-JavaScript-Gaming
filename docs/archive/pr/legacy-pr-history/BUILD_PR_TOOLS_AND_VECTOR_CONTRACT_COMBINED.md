# BUILD_PR_TOOLS_AND_VECTOR_CONTRACT_COMBINED

## Goal
In one pass:
- consolidate duplicated and renamed tool folders under `tools/`
- repair affected references and loading paths
- validate tool, sample, and asset loading paths
- produce the vector asset contract planning/spec outputs

## Canonical Tool Folders Selected
- `tools/Sprite Editor/`
- `tools/Tilemap Studio/`
- `tools/Parallax Scene Studio/`
- `tools/Vector Asset Studio/`
- `tools/Vector Map Editor/`
- `tools/shared/`

## Duplicate Folders Discovered
- `tools/Sprite Editor/`
- `tools/Tile Map Editor/`
- `tools/Parallax Editor/`
- `tools/SVG Background Editor/`
- `tools/Pixel Asset Studio/`
- `tools/SpriteEditorV3/`
- `tools/VectorMapEditor/`

## Files And Folders Moved Or Merged
### Sprite Tool
- active isolated sprite editor finalized at `tools/Sprite Editor/`
- retained `index.html`, `main.js`, `spriteEditor.css`, `README.md`, and `modules/`
- removed duplicate `tools/Pixel Asset Studio/`
- renamed compact `tools/SpriteEditorV3/` path to `tools/Sprite Editor/`

### Tilemap Tool
- retained the canonical implementation in `tools/Tilemap Studio/`
- kept `index.html`, `main.js`, `tileMapEditor.css`, `README.md`, and `samples/`

### Parallax Tool
- retained the canonical implementation in `tools/Parallax Scene Studio/`
- kept `index.html`, `main.js`, `parallaxEditor.css`, `README.md`, and `samples/`

### SVG And Vector Tooling
- retained the canonical implementation in `tools/Vector Asset Studio/`
- kept `index.html`, `main.js`, `svgBackgroundEditor.css`, `README.md`, and `samples/`
- renamed `tools/VectorMapEditor/` to `tools/Vector Map Editor/`
- kept `index.html`, `main.js`, `vectorMapEditor.css`, `README.md`, `how_to_use.html`, `assets/`, and `editor/`

## References Updated
- `tools/index.html` now points to:
  - `tools/Sprite Editor/`
  - `tools/Tilemap Studio/`
  - `tools/Parallax Scene Studio/`
  - `tools/Vector Asset Studio/`
  - `tools/Vector Map Editor/`
- active docs and report paths now use:
  - `tools/Sprite Editor/`
  - `tools/Vector Map Editor/`
- vector-map help/example references were updated to the spaced canonical folder name
- active loading-surface scans show no required refs to deprecated duplicate folders

## Obsolete Folders Removed
- `tools/Sprite Editor/`
- `tools/Tile Map Editor/`
- `tools/Parallax Editor/`
- `tools/SVG Background Editor/`
- `tools/Pixel Asset Studio/`
- `tools/SpriteEditorV3/`
- `tools/VectorMapEditor/`

## Explicit Legacy Exclusion
Old `tools/SpriteEditor_old_keep/` was intentionally excluded except for active reference cleanup.
- no merge work was performed from the legacy folder
- no compatibility work was added for the legacy folder
- active platform paths were redirected to `tools/Sprite Editor/`

## Validation Summary
- verified launcher/index links resolve through canonical tool folders
- verified sprite, tilemap, parallax, vector asset studio, and vector map editor entry files exist
- verified sample-manifest paths for:
  - `tools/Tilemap Studio/samples/sample-manifest.json`
  - `tools/Parallax Scene Studio/samples/sample-manifest.json`
  - `tools/Vector Asset Studio/samples/sample-manifest.json`
- ran `node --check` on:
  - `tools/Sprite Editor/main.js`
  - `tools/Sprite Editor/modules/spriteEditorApp.js`
  - `tools/Sprite Editor/modules/projectModel.js`
  - `tools/Sprite Editor/modules/constants.js`
  - `tools/Tilemap Studio/main.js`
  - `tools/Parallax Scene Studio/main.js`
  - `tools/Vector Asset Studio/main.js`
  - `tools/Vector Map Editor/main.js`
  - `tools/Vector Map Editor/editor/VectorMapEditorApp.js`
- confirmed no required refs remain to deprecated duplicate folders in `tools/`, `games/`, `tests/`, or `scripts/`
- confirmed no required runtime refs remain to old `SpriteEditor` in `tools/`, `games/`, `tests/`, or `scripts/`

## Vector Asset Contract Outputs
- planning/build workflow documented through the combined repo docs bundle
- canonical spec produced at `docs/specs/vector_asset_contract.md`
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
