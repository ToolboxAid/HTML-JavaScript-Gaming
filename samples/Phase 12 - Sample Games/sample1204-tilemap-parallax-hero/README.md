# Sample1204 - Tilemap Parallax Hero

## Purpose
Launch a runnable sample that preserves the proven hero jump/collision contract while adding clear layered parallax depth.

## Controls
- Left Arrow: move hero left
- Right Arrow: move hero right
- Space: jump

## Behavior
Hero movement, jump, gravity, grounded/landing, and tile/platform collision follow the established sample1203 pattern. Background parallax layers move relative to camera motion, with farther layers moving slower than nearer layers.

## Constraints
- preserve proven movement/jump/collision gameplay contract
- parallax layers are background-focused and sample-local
- no new hero abilities or advanced game rules
- no enemies, collectibles, score systems, menus, or save/load
- no engine changes
- no reusable shared logic introduced
- fully removable sample folder
