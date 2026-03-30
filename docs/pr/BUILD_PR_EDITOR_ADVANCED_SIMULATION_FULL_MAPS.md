# BUILD_PR_EDITOR_ADVANCED_SIMULATION_FULL_MAPS

## Goal
Upgrade simulation in both Tile Map Editor and Parallax Editor from simple preview mode to full-map simulation mode.

## Why
Current simulation is useful, but not enough for real authoring validation. The editors need to simulate:
- full scrolling maps
- hero-space movement context
- obstacles and collision layout
- spawn/object placement readability
- foreground/background behavior across a larger playfield

## Editors in Scope
- tools/Tile Map Editor/
- tools/Parallax Editor/

## Required Result
Both editors must support a stronger simulation mode that can preview a full authored map instead of only a static or local view.
