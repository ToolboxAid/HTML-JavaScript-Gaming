Toolbox Aid
David Quesenberry
03/31/2026
BUILD_PR_DEMO1206_TRIGGER_ZONE.md

# BUILD_PR_DEMO1206_TRIGGER_ZONE

## Goal
Implement Demo 1206 - Trigger Zone as the next Phase 12 Demo by preserving the proven foundation:
- tilemap
- hero movement
- jump
- gravity
- collision
- camera follow
- parallax

Add exactly one light interaction layer:
- trigger zone success state

## Scope
In scope:
- Demo 1206 runtime wiring
- hero movement left/right
- Space to jump
- gravity and grounded behavior
- tile/platform collision
- camera follow
- parallax
- visible end/goal trigger zone
- success state/message when hero enters trigger zone
- README alignment
- samples/index.html only if strictly needed

Out of scope:
- collectible counter
- switch/checkpoint behavior
- enemies
- combat
- inventory
- menus
- save/load
- broader gameplay systems
- engine changes

## Required Demo Contract
- preserve the proven gameplay/parallax foundation from Demo 1204
- do not introduce collectible logic
- add exactly one interaction system: trigger zone
- keep the world larger than the viewport
- keep visible scrolling during normal play
- keep all logic sample-local
