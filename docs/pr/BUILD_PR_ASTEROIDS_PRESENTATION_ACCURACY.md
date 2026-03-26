Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_ASTEROIDS_PRESENTATION_ACCURACY.md

# BUILD_PR — Asteroids Presentation Accuracy Pass

## Goal
Improve Asteroids attract-phase readability and move the visual presentation closer to the intended arcade look without changing validated gameplay behavior.

## Scope
- speed up attract-mode phase transitions
- reduce or eliminate unreadable overlap during phase changes
- tune gameplay and attract graphics closer to the intended arcade presentation
- improve shape fidelity where current silhouettes are too generic
- improve color fidelity and line intensity
- keep gameplay logic, physics, scoring, and progression unchanged

## Readability / Transition Work
- shorten attract phase durations where needed
- shorten fade timing so text does not linger too long
- ensure only one primary text block dominates at a time
- reduce overlap between outgoing and incoming phase content
- keep readability ahead of decorative transition effects

## Graphics Accuracy Work
### Shape Fidelity
- refine player ship silhouette
- refine saucer proportions
- refine asteroid outlines
- refine attract/title treatment where current geometry is too generic

### Color / Intensity
- tune colors closer to intended arcade presentation
- improve line intensity balance
- keep background clean and dark for readability
- avoid muddy over-glow or overly stylized color treatment

## Implementation Notes
- keep rendering through existing renderer only
- keep changes in game-local render/adapter/helpers unless a reusable renderer improvement is clearly warranted
- keep attract timing and visual tuning centralized and easy to adjust
- preserve existing validated gameplay behavior

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if actually imported and used)
- persistence / WorldSerializer (only if actually imported and used)

## Engine Boundary Rules
- no Asteroids-specific presentation rules in engine unless reused beyond this game
- no gameplay-system changes in this pass
- only include engine source files in the delta if this PR actually modifies them
- keep Asteroids presentation and attract tuning in the game layer

## Non-Goals
- no physics retuning
- no collision rule changes
- no score rule changes
- no attract controller redesign
- no unrelated refactor expansion

## Acceptance Criteria
- attract transitions feel faster and clearer
- phase overlap no longer hurts readability
- graphics look closer to the intended arcade presentation
- colors and line intensity are improved without reducing readability
- gameplay behavior remains unchanged
- no console errors
- tests updated and passing

## Commit Comment
Improve Asteroids attract timing, readability, and arcade presentation accuracy

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_ASTEROIDS_PRESENTATION_ACCURACY
