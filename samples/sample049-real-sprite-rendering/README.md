# Sample049 - Real Sprite Rendering

## Purpose
Promotes image-backed sprite rendering to the standard actor path.

## What it shows
- generated sprite sheet used as a real image asset
- atlas-based frame selection
- player, npc, and goal rendered from image frames
- camera and tilemap working with sprite blits
- clean handoff to Sample050 animation work

## Controls
- Arrow keys or WASD: move actor

## Behavior
The actor, npc, and goal all render through atlas coordinates and image-frame blitting instead of using color rectangles as the primary presentation path.
