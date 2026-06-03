# BUILD_PR_TOOLS_FOLDER_CONSOLIDATION

## Goal
Consolidate renamed and duplicate tool folders under `tools/`, repair active references, and remove duplicate-folder drift without expanding into unrelated feature work.

## Canonical Tool Folders Selected
- `tools/Sprite Editor/`
- `tools/Tilemap Studio/`
- `tools/Parallax Scene Studio/`
- `tools/Vector Asset Studio/`
- `tools/Vector Map Editor/`
- kept unchanged:
  - `tools/shared/`
  - `tools/SpriteEditor_old_keep/` as parked legacy/out-of-scope

## Duplicate Folders Found
- `tools/Sprite Editor/`
- `tools/Tile Map Editor/`
- `tools/Parallax Editor/`
- `tools/SVG Background Editor/`
- `tools/Pixel Asset Studio/`
- `tools/SpriteEditorV3/`
- `tools/VectorMapEditor/`

## Files Moved Or Renamed
### Sprite Editor
- consolidated the active isolated sprite editor into `tools/Sprite Editor/`
- kept `index.html`, `main.js`, `spriteEditor.css`, `README.md`, and `modules/`
- removed duplicate `tools/Pixel Asset Studio/`
- renamed compact path `tools/SpriteEditorV3/` to spaced canonical path `tools/Sprite Editor/`

### Tilemap Studio
- kept active implementation in `tools/Tilemap Studio/`
- retained `main.js`, `tileMapEditor.css`, `README.md`, `index.html`, and `samples/`

### Parallax Scene Studio
- kept active implementation in `tools/Parallax Scene Studio/`
- retained `main.js`, `parallaxEditor.css`, `README.md`, `index.html`, and `samples/`

### Vector Asset Studio
- kept active implementation in `tools/Vector Asset Studio/`
- retained `main.js`, `svgBackgroundEditor.css`, `README.md`, `index.html`, and `samples/`

### Vector Map Editor
- renamed `tools/VectorMapEditor/` to `tools/Vector Map Editor/`
- retained `main.js`, `vectorMapEditor.css`, `README.md`, `index.html`, `how_to_use.html`, `assets/`, and `editor/`

## References Updated
- updated `tools/index.html` to point at:
  - `tools/Sprite Editor/`
  - `tools/Tilemap Studio/`
  - `tools/Parallax Scene Studio/`
  - `tools/Vector Asset Studio/`
  - `tools/Vector Map Editor/`
- updated active docs and reports to use:
  - `tools/Sprite Editor/`
  - `tools/Vector Map Editor/`
- kept legacy references to `tools/SpriteEditor_old_keep/` only where historical docs explicitly describe the parked legacy folder

## Obsolete Folders Removed
- removed `tools/Sprite Editor/`
- removed `tools/Tile Map Editor/`
- removed `tools/Parallax Editor/`
- removed `tools/SVG Background Editor/`
- removed `tools/Pixel Asset Studio/`
- removed compact `tools/SpriteEditorV3/`
- removed compact `tools/VectorMapEditor/`

## Explicit Legacy Exclusion
Legacy `tools/SpriteEditor_old_keep/` was intentionally ignored for consolidation.
- no merge work was performed from `tools/SpriteEditor_old_keep/`
- no compatibility work was added for `tools/SpriteEditor_old_keep/`
- active platform paths were redirected to `tools/Sprite Editor/` instead

## Validation And Repair Notes
- repaired the live tools hub so the active sprite tool links to `tools/Sprite Editor/index.html`
- added `Vector Map Editor` to the tools hub so the spaced canonical path is launcher-visible
- repaired path references created by folder renames for:
  - sprite editor V3 docs/report paths
  - vector map editor docs/help/example paths
  - parallax sample note text
- confirmed the canonical sample-manifest paths still exist for:
  - `tools/Tilemap Studio/samples/sample-manifest.json`
  - `tools/Parallax Scene Studio/samples/sample-manifest.json`
  - `tools/Vector Asset Studio/samples/sample-manifest.json`
- confirmed no active tool/runtime refs remain in `tools/`, `games/`, `tests/`, or `scripts/` to deprecated duplicate folders
- confirmed no required platform refs remain to legacy `tools/SpriteEditor_old_keep/`

## Scope Guardrails Kept
- no engine core API changes
- no unrelated gameplay or engine refactors
- fixes stayed limited to folder consolidation, path repair, and docs/report updates required by the consolidation
