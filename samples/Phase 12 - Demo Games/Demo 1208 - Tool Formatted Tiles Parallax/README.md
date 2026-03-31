# Demo 1208 - Tool Formatted Tiles Parallax

## Purpose
Provide a runnable authoring-pipeline validation demo that preserves the proven Phase 12 hero movement/jump/collision/camera/parallax behavior while using sample-local content shaped like tool exports.

## Controls
- Left Arrow: move hero left
- Right Arrow: move hero right
- Space: jump

## Behavior
The demo loads tool-shaped tile map content and tool-shaped parallax layer content from local JSON data, then renders real SVG tile and parallax assets in a larger-than-viewport world. Hero traversal uses left/right movement, jump, gravity, grounded behavior, collision, and stable camera follow with visible scrolling.

## Constraints
- preserve proven movement/jump/gravity/collision/camera/parallax contract
- keep scope focused on authoring-pipeline shaped content usage
- no extra interaction or progression systems
- no engine changes
- no tools/tests/games changes
- fully removable sample folder
