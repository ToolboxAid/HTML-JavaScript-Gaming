# BUILD_PR_TOOLS_FOLDER_CONSOLIDATION

## Goal
Consolidate renamed and duplicate tool folders under `toolbox/`, repair active references, and remove duplicate-folder drift without expanding into unrelated feature work.

## Canonical Tool Folders Selected
- `toolbox/Sprite Editor/`
- `toolbox/Tilemap Studio/`
- `toolbox/Parallax Scene Studio/`
- `toolbox/Vector Asset Studio/`
- `toolbox/Vector Map Editor/`
- kept unchanged:
  - `toolbox/shared/`
  - `toolbox/SpriteEditor_old_keep/` as parked legacy/out-of-scope

## Duplicate Folders Found
- `toolbox/Sprite Editor/`
- `toolbox/Tile Map Editor/`
- `toolbox/Parallax Editor/`
- `toolbox/SVG Background Editor/`
- `toolbox/Pixel Asset Studio/`
- `toolbox/SpriteEditorV3/`
- `toolbox/VectorMapEditor/`

## Files Moved Or Renamed
### Sprite Editor
- consolidated the active isolated sprite editor into `toolbox/Sprite Editor/`
- kept `index.html`, `main.js`, `spriteEditor.css`, `README.md`, and `modules/`
- removed duplicate `toolbox/Pixel Asset Studio/`
- renamed compact path `toolbox/SpriteEditorV3/` to spaced canonical path `toolbox/Sprite Editor/`

### Tilemap Studio
- kept active implementation in `toolbox/Tilemap Studio/`
- retained `main.js`, `tileMapEditor.css`, `README.md`, `index.html`, and `samples/`

### Parallax Scene Studio
- kept active implementation in `toolbox/Parallax Scene Studio/`
- retained `main.js`, `parallaxEditor.css`, `README.md`, `index.html`, and `samples/`

### Vector Asset Studio
- kept active implementation in `toolbox/Vector Asset Studio/`
- retained `main.js`, `svgBackgroundEditor.css`, `README.md`, `index.html`, and `samples/`

### Vector Map Editor
- renamed `toolbox/VectorMapEditor/` to `toolbox/Vector Map Editor/`
- retained `main.js`, `vectorMapEditor.css`, `README.md`, `index.html`, `how_to_use.html`, `assets/`, and `editor/`

## References Updated
- updated `toolbox/index.html` to point at:
  - `toolbox/Sprite Editor/`
  - `toolbox/Tilemap Studio/`
  - `toolbox/Parallax Scene Studio/`
  - `toolbox/Vector Asset Studio/`
  - `toolbox/Vector Map Editor/`
- updated active docs and reports to use:
  - `toolbox/Sprite Editor/`
  - `toolbox/Vector Map Editor/`
- kept legacy references to `toolbox/SpriteEditor_old_keep/` only where historical docs explicitly describe the parked legacy folder

## Obsolete Folders Removed
- removed `toolbox/Sprite Editor/`
- removed `toolbox/Tile Map Editor/`
- removed `toolbox/Parallax Editor/`
- removed `toolbox/SVG Background Editor/`
- removed `toolbox/Pixel Asset Studio/`
- removed compact `toolbox/SpriteEditorV3/`
- removed compact `toolbox/VectorMapEditor/`

## Explicit Legacy Exclusion
Legacy `toolbox/SpriteEditor_old_keep/` was intentionally ignored for consolidation.
- no merge work was performed from `toolbox/SpriteEditor_old_keep/`
- no compatibility work was added for `toolbox/SpriteEditor_old_keep/`
- active platform paths were redirected to `toolbox/Sprite Editor/` instead

## Validation And Repair Notes
- repaired the live tools hub so the active sprite tool links to `toolbox/Sprite Editor/index.html`
- added `Vector Map Editor` to the tools hub so the spaced canonical path is launcher-visible
- repaired path references created by folder renames for:
  - sprite editor V3 docs/report paths
  - vector map editor docs/help/example paths
  - parallax sample note text
- confirmed the canonical sample-manifest paths still exist for:
  - `toolbox/Tilemap Studio/samples/sample-manifest.json`
  - `toolbox/Parallax Scene Studio/samples/sample-manifest.json`
  - `toolbox/Vector Asset Studio/samples/sample-manifest.json`
- confirmed no active tool/runtime refs remain in `toolbox/`, `games/`, `tests/`, or `scripts/` to deprecated duplicate folders
- confirmed no required platform refs remain to legacy `toolbox/SpriteEditor_old_keep/`

## Scope Guardrails Kept
- no engine core API changes
- no unrelated gameplay or engine refactors
- fixes stayed limited to folder consolidation, path repair, and docs/report updates required by the consolidation
