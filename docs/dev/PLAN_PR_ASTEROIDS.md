Toolbox Aid
David Quesenberry
03/25/2026
PLAN_PR_ASTEROIDS.md

# PLAN_PR — Asteroids

## Goal
Build Asteroids as close to the original arcade game as possible while reusing proven repo patterns from Space Duel, Space Invaders, attract mode, and score persistence without polluting engine with game-specific logic.

## Scope
- arcade-accurate thrust, rotation, inertia, and wraparound feel
- asteroid spawning, breakup, and progression flow
- UFO/saucer behavior and scoring
- score, lives, wave progression, and game-over loop
- attract mode integration using the reusable AttractModeController
- persistent high-score table and initials entry using a game-local pattern informed by Space Duel
- keep main scene lean by extracting game-local controllers where appropriate

## Reuse Targets
- engine/scenes/AttractModeController.js
- Space Duel-style high-score persistence pattern adapted for Asteroids
- actual-import-only engine class listing discipline
- game-local controller extraction for scene-size control

## Suggested Game-Local Controllers
- AsteroidsPlayerController
- AsteroidsWaveController
- AsteroidsScoreManager
- AsteroidsSaucerController
- AsteroidsSoundController
- AsteroidsAttractAdapter

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if actually imported and used)
- persistence / WorldSerializer (only if actually imported and used)

## Engine Boundary Rules
- reuse existing engine contracts where available
- do not duplicate engine behavior locally
- do not add Asteroids-specific rules to engine unless reused beyond this game
- only include engine source files in the delta if this PR actually modifies them
- keep Asteroids rules, tuning, and content in the game layer

## Planning Areas
- movement feel and rotation tuning
- asteroid breakup behavior and speed scaling
- saucer timing, firing, and scoring
- collision fairness and wraparound behavior
- attract loop presentation
- high-score persistence and initials entry
- sound placeholder or final asset handling based on current repo needs

## Risks
- over-expanding scope before nailing movement feel
- letting main scene get too large
- over-generalizing asteroid-specific behavior into engine

## Output Requirements
- Delta ZIP
- Match repo structure exactly
- Include docs/dev updates if changed
- Include CODEX_COMMANDS.md
- Include COMMIT_COMMENT.txt

## Commit Comment
Plan Asteroids with arcade-accurate scope and reuse of attract/high-score patterns

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: PLAN_PR_ASTEROIDS
