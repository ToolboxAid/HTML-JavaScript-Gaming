Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_SPACE_DUEL_VECTOR_POLISH.md

# BUILD_PR — Space Duel Vector Polish & Glow Pass

## Goal
Polish the validated Space Duel vector rendering so it more closely evokes an Atari color-vector arcade look while preserving all validated gameplay, physics, scoring, and input behavior.

## Scope
- add subtle glow treatment to vector lines
- tune line intensity and stroke layering for a stronger vector-arcade look
- tune gameplay object colors toward brighter arcade-style neon values
- polish thrust flame rendering with controlled variation/flicker
- improve shot visibility and brightness
- keep all changes isolated to the visual/presentation layer

## Visual Targets
- black background with bright, high-contrast vector lines
- subtle CRT-like bloom or layered line glow, not heavy blur
- bright core line with softer secondary glow where appropriate
- stronger readability for player, hazards, enemies, and shots
- preserve clean geometric line shapes from the prior vector-shape pass

## Suggested Implementation
- keep rendering through CanvasRenderer only
- prefer a dual-pass or layered-stroke approach over expensive blur-heavy effects
- keep glow subtle and tunable
- allow color constants to be adjusted centrally
- apply thrust variation as a small render-time visual effect only
- keep shot rendering bright and easy to track

## Engine Classes Used
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme
- input / GamepadInputAdapter (only if currently imported and used by the game page)

## Engine Boundary Rules
- no gameplay rule changes in this pass
- no physics retuning in this pass
- no control/input remapping changes in this pass
- no engine pollution with Space Duel-specific visual rules unless reused beyond this game
- only include engine source files if this PR truly modifies them
- keep vector-polish helpers in the game layer when game-specific

## Non-Goals
- no new enemies or stage rules
- no scoring changes
- no life/progression changes
- no refactor expansion beyond what is required for clean visual polish

## Acceptance Criteria
- vector shapes look more like a color-vector arcade game than plain canvas line art
- glow is subtle and readable, not blurry or muddy
- colors pop clearly on black background
- thrust and shots are easier to read visually
- gameplay behavior remains unchanged from the validated vector-shape pass
- no console errors
- no architecture rule violations

## Commit Comment
Polish Space Duel vector rendering with glow, color tuning, and visual intensity improvements

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_SPACE_DUEL_VECTOR_POLISH
