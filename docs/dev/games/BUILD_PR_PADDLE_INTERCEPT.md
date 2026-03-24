Toolbox Aid
David Quesenberry
03/24/2026
BUILD_PR_PADDLE_INTERCEPT.md

# BUILD_PR — Paddle Intercept

## Goal
Build Paddle Intercept as a game-track entry under games/, not samples/.

This PR should create a small, focused playable that demonstrates:
- predictive motion
- interception logic
- target tracking
- controlled paddle movement toward a future position

This is a game-track physics/AI foundation entry, even though it remains minimal and instructional.

## Critical Placement Rule
This PR MUST create its files under:

games/PaddleIntercept/

Do NOT place this under samples.
Do NOT treat this as a sample-track item.
This belongs under the games track.

## Why This Is a Game
This is more than an isolated teaching mechanic.
It is a playable ball-and-paddle sandbox that shows how to set up:
- ball motion
- paddle motion
- prediction
- interception
- user-facing visualization

That makes it a game-track foundation entry.

## Scope
Include:
- one ball
- one paddle
- bounded rectangular playfield
- predictive intercept behavior
- pause/reset flow
- optional intercept marker for readability
- clean minimal presentation

Keep it focused on interception, not full Pong gameplay.

## Core Concept
Move a paddle to where the ball will be, not where it is.

This PR should demonstrate:
- forward prediction
- time-to-intercept logic
- projected Y interception
- vertical wall-reflection handling
- constrained paddle movement toward the target

## Simulation Rules

### Ball
- constant velocity
- top/bottom wall bounce
- no spin
- no acceleration
- readable stable speed

### Paddle
- vertical movement only
- max speed limited
- cannot teleport
- moves toward predicted intercept position
- remains inside playfield bounds

## Intercept Logic
This is the core behavior to demonstrate.

### Step 1
Determine time to reach paddle X plane:

time = (paddleX - ballX) / ballVelocityX

Only valid when the ball is moving toward the paddle.

### Step 2
Predict raw Y:

predictedY = ballY + ballVelocityY * time

### Step 3
Account for wall bounces:
- reflect Y across top/bottom bounds
- use stable reflection math or equivalent simulation

### Step 4
Move paddle toward predictedY using max-speed limits.

## Controls

### Keyboard
- P = pause / resume
- R or Space = reset

Optional only if still simple:
- T = toggle intercept marker
- M = mute if audio is included

Do NOT use Escape for pause.

### Gamepad (optional)
- Start = pause / resume
- South button = reset
- Optional extra button = toggle intercept marker

## Visual Style
Keep it clean and instructional:
- black background
- one ball
- one paddle
- simple rectangular playfield
- optional intercept marker
- no gradients
- no glow
- no decorative UI panels

### Strong recommendation
Include a small visual intercept marker:
- small dot or line at the predicted intercept point
This makes the behavior much easier to understand.

## Architecture

### Scene
Single scene:
- PaddleInterceptScene

### Game-local modules
Suggested:
- PaddleInterceptWorld.js
- PaddleInterceptAI.js
- PaddleInterceptHud.js

Keep it lightweight and self-contained.

## Reuse Strategy
Reuse where clean:
- ball motion patterns from Bouncing Ball / Pong
- wall bounce logic
- scene lifecycle
- pause/reset structure
- preview/index entry pattern

Do not import full Pong logic or couple to game-specific systems.

## Engine Touch Policy
Likely no engine changes should be needed.

Use existing engine:
- renderer
- scene lifecycle
- input
- fullscreen/theme if already standard
- audio only if already trivial and useful

Otherwise keep this game-local.

## Audio
Recommended:
- omit in first pass

This PR is about prediction and interception, not audio feedback richness.
If included later, do it in a separate refinement PR.

## File Plan

games/PaddleIntercept/
  index.html
  main.js
  assets/
    preview.svg
  game/
    PaddleInterceptScene.js
    PaddleInterceptWorld.js
    PaddleInterceptAI.js
    PaddleInterceptHud.js

Likely updates:
- games/index.html
- docs/dev/games/PADDLE_INTERCEPT.md

Possible tests:
- tests/games/PaddleInterceptWorld.test.mjs
- tests/games/PaddleInterceptValidation.test.mjs

## games/index.html Placement
Place Paddle Intercept under the most appropriate grouped game level for motion/ball-intercept foundations.

Be explicit:
- Paddle Intercept belongs in games
- not samples
- not sample track

## Tests / Validation
Must cover:
- ball motion is correct
- prediction returns a stable reasonable Y
- wall-reflection prediction works
- paddle moves toward predicted position
- paddle respects max speed
- reset restores initial state
- pause works with P
- no console errors

Good regression targets:
- ball moving away from paddle does not produce unstable intercept behavior
- no NaN/infinite prediction math
- paddle does not jitter uncontrollably
- intercept marker stays consistent with predicted target
- repeated pause/reset remains stable

## Acceptance Criteria
Done means:
- Paddle Intercept runs standalone
- files live under games/PaddleIntercept
- no console errors
- prediction is visibly correct
- paddle consistently moves toward the future intercept point
- motion is smooth and readable
- pause/reset work with P
- optional intercept marker works if included
- games/index.html includes it under the correct grouped level
- tests pass
- no engine rule violations

## Non-Goals
Not in this PR:
- scoring
- multiple paddles
- full Pong gameplay
- spin/physics realism
- difficulty systems
- modern UI panels
- audio expansion

Keep it focused on interception.

## Recommended Execution Order
1. scaffold games/PaddleIntercept
2. implement ball motion
3. implement paddle motion limits
4. add prediction logic
5. add paddle tracking toward intercept
6. add pause/reset using P
7. add intercept marker
8. update games/index.html
9. add tests
10. update docs

## Commit Comment
Build Paddle Intercept under games as a predictive interception sandbox

## Notes for Codex
- This belongs under games/PaddleIntercept, not samples
- Repeat: do NOT place this under samples
- Keep the implementation focused, readable, and game-local
- Include an intercept marker if it stays simple
