Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_PACMAN_FULL_AI.md

# BUILD_PR — Pac-Man Full AI

## Goal
Implement Pac-Man Full AI as the Level 6 capstone by adding arcade-style ghost personalities, scatter/chase/frightened timing, ghost-house behavior, target-tile routing, and a presentation that moves closer to the original arcade game while preserving clean engine boundaries.

## Scope
- build game under /games/PacmanFullAI/
- upgrade Pacman Lite concepts into a fuller arcade-style Pac-Man implementation
- implement 4 distinct ghost personalities
- implement scatter/chase/frightened global mode timing
- implement ghost-house and release behavior
- implement target-tile routing
- implement direction reversal rules on mode changes
- keep movement grid-correct and deterministic
- move visuals closer to classic arcade readability and color layout
- add strong debug visibility for AI verification

## Arcade Constants (Reference Targets)
Define and centralize constants for:
- player speed
- ghost speed by mode:
  - normal
  - frightened
  - tunnel
  - eaten/returning
- scatter/chase timing schedule
- frightened duration and flashing window
- house release conditions
- turn-preference / tie-break ordering
- reversal behavior on mode transitions

## Implementation Order

### 1. Global Ghost Mode Scheduler
- implement scatter/chase loop
- implement frightened override
- trigger reversals on mode transitions where appropriate
- keep timing centralized and testable

### 2. Target-Tile System
- compute a target tile per ghost
- make routing decisions based on target tile
- keep target calculation deterministic and debuggable

### 3. Ghost Personalities
Implement in order:
- Blinky: direct chase pressure
- Pinky: ambush offset based on player direction
- Inky: vector/offset target behavior
- Clyde: distance-based chase vs retreat behavior

### 4. Ghost House / Release System
- define home/house positions
- implement release behavior
- implement eaten ghost return path and re-entry flow
- keep rules explicit and testable

### 5. Frightened Mode
- frightened entry and exit behavior
- reversal on entry
- frightened movement choice behavior
- frightened duration and flashing warning

### 6. Routing / Grid Accuracy
- maintain legal turns only
- deterministic intersection choices
- no reverse unless required by rules
- no off-grid drift
- preserve buffered-turn quality from Pacman Lite where applicable

### 7. Presentation / Arcade Readability
- maze closer to arcade silhouette
- ghost colors closer to arcade palette
- score/UI text closer to arcade look
- READY / GAME OVER readability if included
- preserve clarity over decoration

## Suggested Game-Local Modules
- /games/PacmanFullAI/game/PacmanFullAIScene.js
- /games/PacmanFullAI/game/PacmanFullAIWorld.js
- /games/PacmanFullAI/game/PacmanFullAIGrid.js
- /games/PacmanFullAI/game/PacmanFullAINavigator.js
- /games/PacmanFullAI/game/PacmanFullAIPlayerController.js
- /games/PacmanFullAI/game/PacmanFullAIGhostController.js
- /games/PacmanFullAI/game/PacmanFullAIGhostModeScheduler.js
- /games/PacmanFullAI/game/PacmanFullAIGhostHouseController.js
- /games/PacmanFullAI/game/PacmanFullAITargeting.js
- /games/PacmanFullAI/game/PacmanFullAIFrightenedController.js
- /games/PacmanFullAI/game/PacmanFullAIDebugOverlay.js
- /games/PacmanFullAI/game/PacmanFullAIConfig.js

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if actually imported and used)
- camera / Camera2D (only if actually imported and used)
- persistence / WorldSerializer (only if actually imported and used)

## Engine Boundary Rules
- keep Pac-Man-specific ghost logic in the game layer
- do not move target-tile rules into engine
- do not move ghost-house rules into engine
- only promote helpers if clearly reused later
- keep scene orchestration thin
- keep rendering through renderer only

## Debug Requirements
Include visibility for:
- each ghost's current mode
- each ghost's target tile
- current direction
- current intersection decision
- current house/release state
- frightened timing state if active

## Non-Goals
- no engine-wide Pac-Man framework
- no generalized ghost AI framework for all games
- no unrelated attract/high-score expansion in this pass unless directly required
- no premature abstraction beyond what is reused

## Acceptance Criteria
- each ghost has distinct and testable behavior
- scatter/chase/frightened are implemented and visibly correct
- house/release logic works
- target-tile routing is visible and debug-friendly
- movement remains grid-correct and deterministic
- presentation is clearly closer to the classic arcade game
- no console errors
- tests added and passing
- no architecture rule violations

## Commit Comment
Build Pac-Man Full AI with ghost personalities, mode timing, and target-tile behavior

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_PACMAN_FULL_AI
