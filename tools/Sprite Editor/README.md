Toolbox Aid
David Quesenberry
04/03/2026
README.md

# Sprite Editor (From Scratch)

Standalone browser-based Sprite Editor tool built as an isolated implementation under `tools/Sprite Editor/`.

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
- Persistent state row for active tool/color/frame/toggles + cursor position
- Keyboard shortcuts: `P`, `E`, `F`, `G`, `O`, `[`, `]`, `Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z`
- Undo/redo history for drawing and editing actions

## Usability behavior contract
- `Create New Canvas` resets content to a fresh single-frame document.
- Width/height resize preserves existing pixels via nearest-neighbor remap.
- Import/export/save/load status messages include file and size/frame context when available.
- Recent color swatches are deduplicated and newest-first.
- Preview controls use Play/Pause/Reset semantics with visible FPS feedback.

## Project Integration Contract
- Palette source of truth is engine-owned `globalThis.palettesList` from `engine/paletteList.js`.
- Editing remains disabled until a palette is selected from the engine palette list.
- Once selected, palette is locked for the active project/session.
- Palette can only be changed through explicit new-project flow (`Create New Canvas`), which resets lock.
- Saved project JSON persists `paletteRef` identity (`source`, `id`, `locked`) instead of storing an authoritative palette catalog.
- Loading JSON attempts to resolve and lock `paletteRef.id` against engine palette list; unresolved refs load in blocked selection mode.

## Project Asset Registry
- Supports loading and saving `project.assets.json` from the Project I/O panel.
- Sprite saves register/update additive shared entries for:
  - `palettes` (engine palette reference + color set)
  - `sprites` (project-relative sprite document path)
- Sprite project JSON now includes optional `assetRefs` (`paletteId`, `spriteId`) for cross-tool asset linkage.
- Legacy sprite JSON files with no `assetRefs` remain fully loadable.

## Entry point
- `tools/Sprite Editor/index.html`
