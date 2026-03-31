Toolbox Aid
David Quesenberry
03/31/2026
BUILD_PR_DEMO1205_MULTI_SYSTEM_DEMO.md

# BUILD_PR_DEMO1205_MULTI_SYSTEM_DEMO

## Goal
Implement Demo 1205 - Multi-System Demo as the Phase 12 integrated showcase using the already proven foundation:
- tilemap
- hero movement
- jump
- gravity
- collision
- camera follow
- parallax

Add exactly one light interaction layer:
- collectible counter

## Scope
In scope:
- Demo 1205 runtime wiring
- hero movement left/right
- Space to jump
- gravity and grounded behavior
- tile/platform collision
- camera follow
- parallax
- simple collectible pickups
- collectible removal on touch
- counter increment
- optional all-collected success state
- README alignment
- samples/index.html only if strictly needed

Out of scope:
- trigger zone
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
- add exactly one interaction system: collectible counter
- keep the world larger than the viewport
- keep visible scrolling during normal play
- keep all logic sample-local
