Toolbox Aid
David Quesenberry
03/31/2026
BUILD_PR_DEMO1208_TOOL_FORMATTED_TILES_PARALLAX.md

# BUILD_PR_DEMO1208_TOOL_FORMATTED_TILES_PARALLAX

## Goal
Implement Demo 1208 - Tool Formatted Tiles Parallax as the Phase 12 authoring-pipeline validation demo.

This PR must:
- preserve the proven demo foundation from Demo 1204–1207
- load tile/parallax content shaped like it came from the user's tools
- use actual tile assets and SVG parallax assets
- fix the broken Phase 12 Demo 1207 index target so the index opens the runnable demo entry page rather than README.md

## Required foundation to preserve
- tilemap rendering
- hero movement
- Space-to-jump
- gravity
- grounded behavior
- collision
- camera follow
- parallax
- larger-than-viewport scrolling world

## New concept for this PR
Tool-shaped content integration:
- tile assets structured like Tile Map Editor output
- SVG parallax assets/data structured like Parallax Editor output

## Scope
In scope:
- Demo 1208 runtime wiring
- actual tile assets
- actual SVG parallax assets
- sample-local data/config shaped like tool exports
- proven hero/jump/collision/camera/parallax behavior
- fix Demo 1207 index link/path so it resolves to the runnable demo page
- README alignment
- samples/index.html updates required for Demo 1207 fix and Demo 1208 correctness

Out of scope:
- engine changes
- tool rewrites
- non-Phase-12 refactors
- new gameplay systems
- enemies
- inventory
- menus
- save/load

## Required index fix
The current Phase 12 Demo 1207 index target is resolving to:
- README.md

This PR must correct samples/index.html so Demo 1207 points to the runnable demo entry page:
- Demo 1207 - Switch Checkpoint Marker/index.html

Demo 1208 must also point to its runnable entry page, not README.md.

## Data/asset contract
Demo 1208 should look like authored content from the user's tools:
- tile assets stored in a tool-like sample-local structure
- parallax SVG assets stored in a tool-like sample-local structure
- data/config names and shape should read like exported content, not ad hoc runtime-only names

## Validation gates
- Demo 1208 launches
- actual tiles are used
- actual SVG parallax assets are used
- hero movement/jump/collision/camera/parallax remain stable
- tilemap is larger than viewport
- scrolling is visible during normal play
- Demo 1207 index link is fixed to runnable page
- Demo 1208 index link resolves to runnable page
- no diff outside approved paths
- no src/engine/tools/tests/games changes
