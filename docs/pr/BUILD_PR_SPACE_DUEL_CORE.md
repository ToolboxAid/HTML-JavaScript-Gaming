Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_SPACE_DUEL_CORE.md

# BUILD_PR — Space Duel Core

## Goal
Implement Space Duel as close to the original arcade feel as possible, using engine-facing patterns and keeping the main scene lean.

## Scope

### Core Gameplay
- ship rotation (left/right)
- thrust-based movement with inertia and no friction
- projectile firing
- wrap-around playfield if matched in the approved implementation
- collision handling for ship, bullets, enemies, and hazards

### Player Modes
- 1-player mode
- 2-player mode
- same-screen play behavior aligned as closely as practical to the original game
- shared space interaction handled in game-local logic

### Enemy / Object System
- geometric enemy / hazard behavior
- split / break behavior where applicable
- wave progression
- score and life flow

### Physics Feel
- inertia-based movement
- rotation tuning
- thrust tuning
- projectile speed and lifetime tuning

### Sound Placeholder WAV Generation
Generate placeholder WAV files for:
- thrust
- fire
- explosion
- player death
- enemy or hazard break / split
- bonus / score
- start / game over

Requirements:
- valid WAV files
- small and loadable
- stable naming
- easy replacement later by user

### Rendering Style
- vector-style presentation using current renderer approach
- clean geometric shapes
- strong readability and contrast

## Refactor / Structure Target
Keep `SpaceDuelScene` as coordinator only.

### Extract immediately
- PlayerController
- PhysicsController
- WaveController
- ScoreManager
- SoundController

## Engine Classes Used
- CanvasRenderer — rendering entry point only
- InputService — base input handling
- ActionInputService — action-mapped gameplay input
- Scene contract — constructor / init(engine) / update(dt, engine) / render(renderer, engine) / dispose(engine)
- Camera2D / CameraSystem — only if the implementation actually needs them
- World and engine systems — only where consumed through public contracts
- shared UI layout assets — only if used by the game shell

## Engine Boundary Rules
- Reuse existing engine contracts where available
- Do not duplicate engine behavior locally
- Do not add Space Duel-specific logic to engine unless reused beyond this game
- Only include engine source files in the delta if this PR actually modifies them
- Keep Space Duel rules, tuning, and flow in the game layer

## Acceptance Criteria
- movement feels like arcade inertia-based control
- rotation and thrust are responsive and tunable
- shooting works cleanly
- enemies and hazards behave consistently
- placeholder WAV files load and play
- no console errors
- main scene remains modular and not oversized
- no new architecture violations

## Commit Comment
Build Space Duel core gameplay, physics, controls, and placeholder sound system

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_SPACE_DUEL_CORE
