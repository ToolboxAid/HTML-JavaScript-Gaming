Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_ASTEROIDS_PRESENTATION.md

# BUILD_PR — Asteroids Vector & Arcade Presentation

## Goal
Bring Asteroids up to the same arcade-fidelity presentation level as Space Duel by adding vector-accurate visuals, attract-mode presentation, and persistent high-score flow while preserving the validated core gameplay loop.

## Scope
- replace any placeholder or non-arcade visuals with Asteroids-style vector presentation
- ensure ship, asteroid, saucer, and projectile visuals are line-based and arcade-appropriate
- add attract-mode presentation using the reusable `AttractModeController`
- add persistent high-score table and initials-entry flow using the proven Space Duel pattern adapted for Asteroids
- keep gameplay rules stable unless a presentation integration requires a minimal fix

## Presentation Targets

### Vector Rendering
- line-based rendering only for gameplay objects
- no filled gameplay shapes
- consistent stroke weight
- black background with bright, readable vector lines
- rotate and translate shapes at render time where applicable

### Shape Accuracy
- classic Asteroids player ship silhouette
- irregular asteroid outlines instead of circles/placeholders
- distinct saucer presentation if both sizes/variants are used
- readable projectile visuals

### Visual Polish
- subtle vector-style glow or layered-line presentation if supported by current renderer approach
- brightness tuning for readability without muddy blur
- preserve clear object separation on dark background

## Attract Mode
- integrate `engine/scenes/AttractModeController.js`
- add title phase
- add high-score phase
- add demo phase or deterministic attract animation
- ensure attract exits immediately on gameplay input
- keep Asteroids-specific attract rendering in the game layer

## High Score Persistence
- add game-local Asteroids high-score persistence service
- add deterministic initials-entry flow for qualifying scores
- render persisted scores in attract mode
- seed default table cleanly when storage is empty
- keep storage key game-specific and stable

## Suggested Game-Local Files
- /games/Asteroids/game/AsteroidsAttractAdapter.js
- /games/Asteroids/game/AsteroidsHighScoreService.js
- /games/Asteroids/game/AsteroidsInitialsEntry.js
- /games/Asteroids/game/render or shapes helpers as needed

## Reuse Targets
- /engine/scenes/AttractModeController.js
- Space Duel high-score persistence pattern
- actual-import-only engine class listing discipline
- scene-thinning via game-local helpers/controllers

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
- keep Asteroids rendering, attract content, and high-score rules in the game layer

## Non-Goals
- no core physics rewrite
- no asteroid breakup rule rewrite
- no new broad engine UI framework
- no unrelated refactor expansion

## Acceptance Criteria
- Asteroids presents with arcade-appropriate vector visuals
- attract mode works cleanly
- persistent high scores and initials entry work cleanly
- validated core gameplay remains intact
- no console errors
- no architecture rule violations
- tests updated and passing

## Commit Comment
Add Asteroids vector rendering, attract mode, and high score presentation

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_ASTEROIDS_PRESENTATION
