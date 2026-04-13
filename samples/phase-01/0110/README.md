# Sample 0110 - Collision Response

## Purpose
Turns collision from detection into gameplay by preventing the player from moving through a blocking obstacle.

## What it shows
- keyboard-controlled movement
- one solid block
- AABB overlap test
- movement revert as simple collision response
- themed debug rendering

## Controls
- Arrow keys: move player

## Behavior
When the player tries to move into the block, the attempted movement is rejected and the player stays in the last valid position.
