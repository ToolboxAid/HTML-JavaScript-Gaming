# BUILD_PR_TOOLS_FOLDER_CONSOLIDATION

## Goal
Consolidate duplicate and rename-created tool folders under `tools/` into approved canonical paths, repair active references, and remove duplicate-folder drift without introducing unrelated feature work.

## Canonical Tool Folders Selected
- `tools/Sprite Editor V3/`
- `tools/Tilemap Studio/`
- `tools/Parallax Scene Studio/`
- `tools/Vector Asset Studio/`
- Kept unchanged and outside this consolidation pair set:
  - `tools/Vector Map Editor/`
  - `tools/shared/`
  - legacy `tools/SpriteEditor_old_keep/`
  - legacy `tools/Sprite Editor V3/`

## Duplicate Folders Found
- `tools/Sprite Editor/` duplicated the active pixel-art implementation now consolidated into `tools/Sprite Editor V3/`
- `tools/Tile Map Editor/` duplicated the active tilemap implementation now consolidated into `tools/Tilemap Studio/`
- `tools/Parallax Editor/` duplicated the active parallax implementation now consolidated into `tools/Parallax Scene Studio/`
- `tools/SVG Background Editor/` duplicated the active vector-authoring implementation now consolidated into `tools/Vector Asset Studio/`

## Files Moved And Merged
### Sprite Editor V3
- moved `main.js`
- moved `spriteEditor.css`
- moved `modules/`
- replaced wrapper `index.html` with the real tool entry and updated visible naming
- replaced wrapper `README.md` with canonical tool documentation

### Tilemap Studio
- moved `main.js`
- moved `tileMapEditor.css`
- moved `samples/`
- replaced wrapper `index.html` with the real tool entry and updated visible naming
- replaced wrapper `README.md` with canonical tool documentation

### Parallax Scene Studio
- moved `main.js`
- moved `parallaxEditor.css`
- moved `samples/`
- replaced wrapper `index.html` with the real tool entry and updated visible naming
- replaced wrapper `README.md` with canonical tool documentation

### Vector Asset Studio
- moved `main.js`
- moved `svgBackgroundEditor.css`
- moved `samples/`
- replaced wrapper `index.html` with the real tool entry and updated visible naming
- replaced wrapper `README.md` with canonical tool documentation

## References Updated
- updated `tools/index.html` so launcher text points only at canonical studio folders
- updated canonical tool entrypoints and READMEs to use approved studio names
- updated canonical runtime metadata:
  - `tools/Parallax Scene Studio/main.js` now writes `generatedBy: "tools/Parallax Scene Studio"`
  - `tools/Vector Asset Studio/main.js` now reports `Vector Asset Studio ready.`
- updated docs and validation reports to replace stale references to:
  - `tools/Sprite Editor/`
  - `tools/Tile Map Editor/`
  - `tools/Parallax Editor/`
  - `tools/SVG Background Editor/`

## Obsolete Folders Removed
- removed `tools/Sprite Editor/`
- removed `tools/Tile Map Editor/`
- removed `tools/Parallax Editor/`
- removed `tools/SVG Background Editor/`

## Explicit Legacy Exclusion
Legacy `tools/SpriteEditor_old_keep/` was intentionally ignored and remains out of scope.
- no merge work was performed from `tools/SpriteEditor_old_keep/`
- no compatibility work was added for `tools/SpriteEditor_old_keep/`
- no `tools/SpriteEditor_old_keep/` historical cleanup was attempted beyond validating that no active required tool-loading paths depend on it

## Validation Coverage
- launcher/index links target canonical folders only
- canonical tool HTML entrypoints exist
- canonical CSS and JS paths exist for each tool
- tilemap sample manifest remains at `tools/Tilemap Studio/samples/sample-manifest.json`
- parallax sample manifest remains at `tools/Parallax Scene Studio/samples/sample-manifest.json`
- vector/SVG sample manifest remains at `tools/Vector Asset Studio/samples/sample-manifest.json`
- no remaining repo references to deprecated duplicate active tool folders
- no remaining required references to old `SpriteEditor`

## Scope Guardrails Kept
- no engine core API changes
- no runtime/gameplay feature expansion
- no unrelated engine or gameplay refactors
- cleanup stayed scoped to folder consolidation and path repair
