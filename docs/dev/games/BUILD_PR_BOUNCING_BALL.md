Toolbox Aid
David Quesenberry
03/24/2026
BUILD_PR_BOUNCING_BALL.md

# BUILD_PR — Bouncing Ball

## Goal
Build Bouncing Ball as a very small, clean arcade-style game/demo that reinforces the engine rules without adding unnecessary systems.

This should be intentionally simple:
- one ball
- bounded playfield
- clean wall bounce behavior
- start/pause/reset flow
- keyboard + gamepad support where appropriate
- optional minimal sound hooks through the engine audio service

## Why This Is Next
Bouncing Ball is a good reset point because it validates the basics again in a stripped-down form:
- motion
- wall collision
- bounce response
- timing consistency
- simple input hooks
- clean presentation

It is intentionally smaller than Pong and Breakout.

## Initial Scope
Recommended implementation:
- one ball only
- fixed rectangular playfield
- immediate readable motion
- clean bounce on all four walls
- start/reset
- pause
- optional mute if sound is wired
- optional simple HUD only if useful

Do not turn this into another paddle game.

## Game Concept
Preferred version:
- ball starts on start/serve
- ball bounces forever inside bounds
- no win/lose state required
- no paddle
- no levels
- no gravity

## Arcade Authenticity Requirement
Bouncing Ball should still look like a classic simple arcade-style program, not a modern toy.

### Visual rules
- black background
- simple rectangular playfield
- white ball
- optional white boundary lines
- minimal text only if needed
- no gradients
- no shadows
- no glow
- no rounded UI panels

### Motion rules
- immediate start or clean start/reset
- crisp bounce
- no floaty easing
- no particle effects
- no fancy trails

## Gameplay Rules

### Ball
- one ball only
- constant readable speed
- reflects cleanly on wall contact
- should never stick to walls
- should remain fully visible inside playfield bounds

### Arena
- fixed rectangular bounds
- wall collisions are the primary mechanic

### Controls
Recommended:
- Space or Enter = start/reset
- Escape = pause
- M = mute if sound included
- optional speed toggle only if it stays simple

### Gamepad
Through engine input only:
- south button = start/reset
- start = pause

No raw browser input in game logic.

## Sound
Minimal only.

Recommended events if included:
- wall bounce
- reset/start

Use very short generated tones only.
Do not add music or layered audio.

If sound adds clutter to this PR, omit it.

## Architecture

### Scene
Single scene:
- BouncingBallScene

Scene responsibilities:
- initialize state
- manage start/pause/reset
- coordinate world update
- render through renderer path only
- trigger semantic audio events if used

### Game-local modules
Suggested:
- BouncingBallWorld.js
- BouncingBallInputController.js
- BouncingBallHud.js (only if actually needed)

Keep this lightweight.
Do not split into unnecessary systems unless there is a clear benefit.

## Reuse Strategy
Reuse patterns from Pong/Breakout where clean:
- input controller structure
- scene flow
- audio hook pattern
- preview asset/index entry pattern

Do not force reuse if it makes this tiny game worse.

## Engine Touch Policy
Likely no engine changes should be needed.

Existing engine capabilities should already cover:
- input
- audio
- renderer
- scene lifecycle

Only touch engine if a truly tiny reusable helper is clearly justified.

## File Plan
Suggested structure:

games/
  bouncing-ball/
    index.html
    main.js
    assets/
      preview.svg
    game/
      BouncingBallScene.js
      BouncingBallWorld.js
      BouncingBallInputController.js
      BouncingBallHud.js

Likely updates:
- games/index.html
- docs/dev/games/BOUNCING_BALL.md

Possible tests:
- tests/games/BouncingBallWorld.test.mjs
- tests/games/BouncingBallValidation.test.mjs

## games/index.html Update Requirement
Update games/index.html so the grouped playable sections include the missing levels, not just the currently present ones.

Target structure should include a full ordered progression like:
- Level 1 - Basic Motion
- Level 2 - Forces & Motion Systems
- Level 3 - Collision Mastery
- Level 4 - Classic Arcade

Place Bouncing Ball under:
- Level 1 - Basic Motion

Gravity should have a clear reserved home under:
- Level 2 - Forces & Motion Systems

Keep the existing grouped structure style consistent and do not remove existing content.

## Tests / Validation

### Must cover
- ball moves correctly
- ball bounces correctly off all walls
- ball remains in bounds after repeated updates
- pause works
- reset works
- keyboard input works
- gamepad input works if included
- no console errors

### Good regression targets
- no wall-sticking
- no corner jitter
- reset restores clean initial state
- bounce angle remains stable after many updates

## Acceptance Criteria
Done means:
- Bouncing Ball runs standalone
- no console errors
- ball motion is clean and readable
- bounce behavior is correct
- pause/reset work
- keyboard works
- gamepad works if wired
- audio hooks work if included
- tests pass
- no engine rule violations
- it looks like a simple classic arcade program at a glance
- games/index.html includes the missing level groupings in a clean ordered progression

## Non-Goals
Not in this PR:
- paddle gameplay
- multiple balls
- power-ups
- particles
- trails
- advanced physics
- gravity
- levels
- scoring complexity
- modern menu/UI shell

Keep it intentionally small.

## Recommended Execution Order
1. scaffold games/bouncing-ball
2. implement world state and bounce logic
3. add start/pause/reset flow
4. wire keyboard and optional gamepad controls
5. add optional simple bounce audio
6. add minimal HUD only if needed
7. update games/index.html with missing level groupings
8. add tests
9. update docs

## Commit Comment
Build Bouncing Ball as a minimal arcade-style motion and bounce game

## Notes for Codex
- Keep the implementation very small
- Do not introduce gravity yet
- Keep presentation classic and uncluttered
- Update games/index.html to add the missing level groupings while preserving the grouped playable structure already in place
