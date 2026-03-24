Toolbox Aid
David Quesenberry
03/24/2026
BUILD_PR_PONG.md

# BUILD_PR — Pong

## Goal
Build Game #3: Pong as a standalone game with:
- Tennis
- Hockey
- Handball
- Jai-Alai
- Paddle English
- Keyboard + Gamepad support

## Locked Rules
- Follow PLAN_PR → BUILD_PR → APPLY_PR
- No breaking changes
- Reuse engine systems where clearly appropriate
- Input only through approved engine abstractions
- No rendering outside renderer
- Scenes orchestrate, systems contain logic
- Update docs if engine contracts change

## Current Project Context
- Samples 001–182 are complete and working
- samples/index.html is up to date
- Current focus is Game #3: Pong
- Known gaps:
  - Docs mismatch (_shared vs engine/ui)
  - Gamepad abstraction needed

## Scope
This BUILD_PR authorizes Codex to build:
1. A standalone Pong game under games/
2. Reusable engine-safe gamepad input abstraction
3. Config-driven game modes
4. Paddle English
5. HUD/state flow needed to play and validate the game

## Engine Additions Allowed
### Required
- engine/input/GamepadInputAdapter.js

### Optional, only if clearly reusable
- minimal input plumbing updates
- tiny math helper(s) such as clamp or bounce angle helpers

Do not add broad engine abstractions unless clearly justified by current and future use.

## Game Structure
Suggested file layout:

games/
  pong/
    index.html
    game.js
    scenes/
      PongScene.js
    config/
      PongModeConfig.js
    systems/
      PongBallSystem.js
      PongPaddleSystem.js
      PongCollisionSystem.js
      PongScoreSystem.js
    input/
      PongInputController.js
    ui/
      PongHud.js

## Scene Responsibilities
PongScene should:
- initialize engine-facing state
- load/select mode config
- reset rounds
- coordinate paddles, ball, and score flow
- delegate logic to systems
- render via renderer-facing flow only

## Mode Design
Use config-driven modes, not separate hardcoded forks.

### Tennis
- classic two-paddle Pong
- open back edge behind each paddle
- miss gives point to opponent

### Hockey
- top/bottom walls active
- goal-zone behavior at each end
- flatter rebound feel is acceptable

### Handball
- one-paddle rally mode
- far wall returns the ball
- second paddle absent or disabled

### Jai-Alai
- one-sided fast rebound mode
- emphasize speed and sharper wall interactions

## Paddle English
Outgoing ball angle should depend on:
- contact point on paddle
- paddle movement at impact
- optional analog intensity from gamepad input

Clamp resulting angle so play remains stable and does not stall vertically.

## Input Model
### Keyboard
- Player 1: W / S
- Player 2: ArrowUp / ArrowDown
- Start / Serve: Space or Enter
- Pause: Escape

### Gamepad
Via engine abstraction only:
- left stick Y
- d-pad up/down
- south button = serve/confirm
- start = pause

## Acceptance Criteria
Done means:
- game runs standalone
- no console errors
- keyboard works
- gamepad works
- all four modes function
- paddle English is noticeable
- no engine rule violations
- docs updated if engine input contracts changed

## Non-Goals
- network multiplayer
- AI opponent
- attract mode
- audio polish
- tournament shell
- visual effects beyond simple arcade presentation

## Build Sequence
1. Add engine-safe gamepad input abstraction
2. Implement Pong core loop
3. Add collisions, score, serve/reset
4. Add Paddle English
5. Add Tennis, Hockey, Handball, Jai-Alai
6. Add HUD/menu states
7. Update docs if engine contract changed

## Commit Comment
Build Pong with multi-mode play, paddle english, and engine-safe gamepad input

## Notes for Codex
- Keep the implementation surgical
- Do not refactor unrelated samples or engine areas
- Do not bypass input or renderer rules
- Prefer game-local systems unless logic is clearly reusable outside Pong
