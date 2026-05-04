# Palette Manager V2

Palette Manager V2 is the runtime tool for editing the global palette data stored at `tools.palette-browser`.

## Contract
- Runtime tool id: `palette-manager-v2`
- Global data key: `tools.palette-browser`
- Managed data: `tools.palette-browser.swatches`
- Swatch shape: `{ "symbol": "A", "hex": "#RRGGBB", "name": "Color Name", "source": "source-id" }`
- Read-only source palettes: `src/engine/paletteList.js`

## Workflow
- Add, edit, and remove user swatches from the User Palette accordion.
- Browse Crayola, W3C, and JavaScript source palettes without editing the source lists.
- Use the red tack to copy a source swatch into the user palette.
- Use the green tack to remove a pinned/user swatch when `isSwatchUsedByTool(swatch)` allows removal.
- Import, copy, and export the exact `tools.palette-browser` JSON wrapper.
