# Palette Browser / Manager

Palette Browser / Manager is a first-class tools surface for shared engine palettes and local editable palette workflows.

## Phase 1
- Browse built-in palettes from `src/engine/paletteList.js`.
- Duplicate a palette into a local editable copy.
- Rename custom palettes and add or remove swatches.
- Validate duplicate names, missing metadata, and invalid color values.
- Copy or export palette JSON.
- Publish a lightweight shared palette handoff for active art tools.

## Boundary
- Built-in engine palettes remain source-of-truth references.
- Local edits stay in browser storage until exported.
- This tool does not change engine runtime behavior.
