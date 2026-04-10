# Sample 1208 - Tool Formatted Tiles Parallax

## Purpose
Provide a runnable authoring-pipeline validation demo that preserves the proven Phase 12 hero movement/jump/collision/camera/parallax behavior while using sample-local content shaped like tool exports.

## Controls
- Left Arrow: move hero left
- Right Arrow: move hero right
- Space: jump

## Behavior
The demo loads tilemap layer data and tileset references shaped like Tile Map Editor export output, plus parallax layer data shaped like Parallax Editor export output. Rendering uses a real PNG tileset atlas (source-rect drawImage) and real SVG parallax layers rendered onto canvas in a larger-than-viewport world. Hero traversal uses left/right movement, jump, gravity, grounded behavior, collision, and stable camera follow with visible scrolling.

## Constraints
- preserve proven movement/jump/gravity/collision/camera/parallax contract
- keep scope focused on authoring-pipeline shaped content usage
- render tiles from atlas image frames (no colored tile-rect fallback in normal mode)
- no extra interaction or progression systems
- no engine changes
- no tools/tests/games changes
- fully removable sample folder
