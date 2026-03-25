Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_PACMAN_LITE.md

# BUILD_PR — Pac-Man (Lite)

## Goal
Implement Pac-Man (Lite) as a playable Level 6 game focusing on grid-locked movement, buffered turns, legal navigation, and simplified ghost routing to create believable maze pressure.

## Scope
- build game under /games/PacmanLite/
- implement tile/grid-based maze
- implement player grid movement with buffered turns
- implement legal turn handling at intersections
- implement simplified ghost movement and routing
- implement minimal pellet/target loop to create pressure
- add debug visibility for routing and targeting
- keep scene lean using game-local controllers
- no engine changes

## Implementation Order

### 1. Grid / Maze System
- define tile size and grid layout
- mark walls vs walkable paths
- identify intersections/nodes
- expose helper: isWalkable(x, y), getNeighbors(node)

### 2. Player Movement (Critical)
- grid-locked movement
- currentDirection + nextDirection (buffer)
- allow turns only at valid intersections
- snap cleanly to grid centers
- prevent wall clipping

### 3. Ghost Movement (Lite)
- grid-based movement like player
- choose direction at intersections
- avoid reversing direction unless forced
- simple chase: target = player tile/position

### 4. Routing Logic
- evaluate legal directions at intersections
- choose best direction toward target
- deterministic tie-breaking
- no A* (keep simple and testable)

### 5. Maze Loop (Minimal)
- pellets or simple consumables
- remove pellet on contact
- basic loop to validate pressure

### 6. Debug Overlay
- show player tile + direction
- show queued direction
- show ghost target tile
- show intersection nodes
- optional path/decision markers

## Suggested Files
- /games/PacmanLite/game/PacmanLiteScene.js
- /games/PacmanLite/game/PacmanLiteWorld.js
- /games/PacmanLite/game/PacmanLiteGrid.js
- /games/PacmanLite/game/PacmanLiteNavigator.js
- /games/PacmanLite/game/PacmanLitePlayerController.js
- /games/PacmanLite/game/PacmanLiteGhostController.js
- /games/PacmanLite/game/PacmanLiteGhostStateMachine.js
- /games/PacmanLite/game/PacmanLiteDebugOverlay.js
- /games/PacmanLite/game/PacmanLiteConfig.js

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if used)
- camera / Camera2D (only if used)

## Engine Boundary Rules
- keep maze rules and routing in game layer
- do not add Pac-Man-specific logic to engine
- only promote helpers if reused later
- keep scene orchestration thin

## Non-Goals
- no full ghost personalities (Blinky/Pinky/Inky/Clyde)
- no scatter/frightened modes
- no full pathfinding system (A*)
- no engine modifications
- no over-abstraction

## Acceptance Criteria
- player movement feels correct and responsive
- buffered turns work consistently
- legal turns enforced (no wall clipping)
- ghosts navigate maze legally
- simplified ghost pressure is visible
- debug overlay clearly shows movement and routing
- no console errors
- tests added and passing

## Commit Comment
Build Pac-Man Lite with grid movement, buffered turns, and simplified ghost routing

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_PACMAN_LITE
