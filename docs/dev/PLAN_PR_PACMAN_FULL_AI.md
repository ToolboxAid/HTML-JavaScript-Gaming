Toolbox Aid
David Quesenberry
03/25/2026
PLAN_PR_PACMAN_FULL_AI.md

# PLAN_PR - Pacman Full AI

## Goal
Upgrade Pacman from Lite routing into a full-AI arcade-style behavior model with distinct ghost personalities, scatter/chase/frightened state timing, and deterministic decision flow.

## Scope
- build under `/games/Pacman/` as the full-AI follow-up track
- implement ghost personality targeting rules (Blinky, Pinky, Inky, Clyde)
- implement global mode cycle:
  - scatter
  - chase
  - frightened (on power pellet)
- implement frightened behavior timing and recovery
- keep deterministic tile-based movement, turn buffering, and legal navigation
- preserve clear HUD/readability and debug visibility
- keep scene lean by splitting AI/state/timing into game-local controllers

## Relationship to Pacman Lite
- reuse Pacman Lite grid/movement foundations where they remain valid
- do not regress Lite feel while layering in full ghost behavior
- prefer extracting shared game-local helpers inside `/games/Pacman/` over engine promotion

## Reuse Targets
- Pacman Lite movement/grid/tile helper patterns
- existing input + scene orchestration pattern from current arcade games
- game-local debug overlay pattern for AI intent/timing diagnostics

## Suggested Game-Local Controllers
- PacmanMazeController
- PacmanPlayerController
- PacmanGhostController
- PacmanGhostTargeting
- PacmanModeTimerController
- PacmanFrightenedController
- PacmanCollisionController
- PacmanHudRenderer

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if actually imported and used)
- persistence / StorageService (only if score persistence is included)

## Engine Boundary Rules
- keep Pacman AI/state timing/personality rules in game layer
- do not add Pacman-specific ghost logic to engine
- only move helpers to engine if reused by multiple games
- include engine file deltas only when strictly necessary

## Planning Areas
- ghost-specific target tile computation
- mode schedule timing and transitions
- frightened speed/timing and visual state indicators
- tunnel speed and cornering behavior accuracy
- collision outcome rules during normal vs frightened states
- deterministic tie-break rules at intersections
- testability of timing transitions and target calculation

## Risks
- over-complexity in one pass causing unstable behavior
- non-deterministic state transitions from timer/input coupling
- scene bloat if controllers are not separated early
- accidental engine leakage of Pacman-specific logic

## Non-Goals
- no engine-level AI framework redesign
- no unrelated hub/UI refactor
- no multiplayer/network scope

## Output Requirements
- Delta ZIP
- Match repo structure exactly
- Include docs/dev updates if changed
- Include CODEX_COMMANDS.md
- Include COMMIT_COMMENT.txt

## Commit Comment
Plan Pacman Full AI with personality ghosts, mode timers, and deterministic arcade behavior

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: PLAN_PR_PACMAN_FULL_AI
