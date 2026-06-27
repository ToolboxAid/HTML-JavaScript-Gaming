# Palette Manager V2

Palette Manager V2 is the runtime tool for editing validated palette swatches for V2 workspace contexts.

## Contract
- Runtime tool id: `palette-manager-v2`
- Workspace manifest tool key: `tools.palette-manager-v2`
- Managed workspace data: `tools.palette-manager-v2.swatches`
- Swatch shape: `{ "symbol": "A", "hex": "#RRGGBB or #RRGGBBAA", "name": "Color Name", "source": "source-id", "tags": ["optional-tag"] }`
- Optional tags are stored as an array of non-empty strings.
- Read-only source palettes: `src/engine/paletteList.js`

## Workflow
- Add and edit user-defined swatches from the Add accordion. Swatches created with Add use `User Added` as their source.
- Add shows populated symbol, hex, and name data only for selected `User Added` swatches; source-palette selections clear the form.
- Add and Update reject duplicate user swatch names, RGB/hex values, and symbols.
- Selected Swatch shows selected details with symbol, hex, name, source, and current tags. Click a selected tag to remove it from the selected swatch.
- Use the Tags accordion to add typed tags or toggle existing user palette tags on the currently selected swatch.
- Tags are normalized to lowercase when added, imported, displayed, stored, copied, and exported.
- Browse Crayola, W3C, and JavaScript source palettes without editing the source lists.
- Use the red tack to copy a source swatch into the user palette.
- Use the green tack to remove a pinned/user swatch when `isSwatchUsedByTool(swatch)` allows removal.
- Import, copy, and export the exact Palette Manager V2 JSON wrapper, including swatch tags when present.
