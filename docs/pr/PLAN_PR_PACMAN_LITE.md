Toolbox Aid
David Quesenberry
03/25/2026
PLAN_PR_PACMAN_LITE.md

# PLAN_PR - Pacman Lite

## Goal
Build a playable Pacman Lite game-track title focused on core maze traversal, pellet collection, ghost pressure, and arcade readability while keeping AI logic in the game layer.

## Scope
- player movement on a tile maze with clean cornering rules
- pellet and power-pellet collection loop
- score progression and life loss handling
- lightweight ghost behavior set for Lite scope (no full original AI tables yet)
- round reset and game-over flow
- optional attract mode integration if it fits cleanly with existing reusable controller
- keep scene lean by extracting game-local controllers

## Placement
- `/games/PacmanLite/`

## Reuse Targets
- `engine/scenes/AttractModeController.js` (if attract is included in this pass)
- existing score/lives/game-over flow patterns from arcade builds
- game-local controller separation pattern used in recent games
- shared input and rendering engine contracts

## Suggested Game-Local Controllers
- PacmanLiteMazeController
- PacmanLitePlayerController
- PacmanLiteGhostController
- PacmanLiteScoreManager
- PacmanLiteRoundController
- PacmanLiteHudRenderer

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if actually imported and used)
- persistence / StorageService (only if high-score persistence is included)

## Engine Boundary Rules
- keep maze rules, ghost rules, and tile behavior in game layer
- do not add Pacman-specific AI/maze logic to engine
- only modify engine files if behavior is truly reusable
- keep tuning/content data local to Pacman Lite

## Planning Areas
- tile alignment and turn buffering at intersections
- ghost pressure pacing for Lite mode
- collision fairness (player vs ghost timing)
- power-pellet timing and frightened behavior scope
- score/lives balancing for short arcade sessions
- readability of maze, pellets, and HUD

## Risks
- over-expanding from Lite into full Pacman AI complexity too early
- scene bloat if maze/ghost/player systems are not separated
- tuning drift that makes movement feel imprecise at tile corners

## Non-Goals
- no full original Pacman ghost personality table replication in this pass
- no engine-level pathfinding framework redesign
- no unrelated UI framework refactor

## Output Requirements
- Delta ZIP
- Match repo structure exactly
- Include docs/dev updates if changed
- Include CODEX_COMMANDS.md
- Include COMMIT_COMMENT.txt

## Commit Comment
Plan Pacman Lite with game-layer maze loop, lightweight ghost pressure, and clean engine boundaries

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: PLAN_PR_PACMAN_LITE
