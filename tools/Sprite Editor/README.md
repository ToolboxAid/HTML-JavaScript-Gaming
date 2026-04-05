Toolbox Aid
David Quesenberry
04/04/2026
README.md

# Sprite Editor

Standalone browser-based pixel art tool under `tools/Sprite Editor/`.

## Included features
- New sprite project canvas with configurable width/height
- Zoom (pixel-size) control
- Grid toggle
- Pencil, eraser, and fill tools
- Palette + active color + recent color swatches
- Frame workflow: add, duplicate, delete, previous/next
- Onion-skin preview toggle
- Import PNG into current frame
- Export PNG for current frame
- Export sprite sheet for all frames
- Save/load editor project JSON
- Transparent background support
- Animation preview panel with FPS control
- Keyboard shortcuts and undo/redo support

## Project integration
- Palette source of truth is engine-owned `globalThis.palettesList` from `engine/paletteList.js`.
- Editing remains disabled until a palette is selected.
- Saved project JSON persists `paletteRef` identity and optional `assetRefs`.
- Loading unresolved palette refs leaves the project in blocked selection mode.

## Project asset registry
- Supports loading and saving `project.assets.json`.
- Sprite saves register additive shared entries for `palettes` and `sprites`.
- Legacy sprite JSON files with no `assetRefs` remain loadable.

## Entry point
- `tools/Sprite Editor/index.html`
