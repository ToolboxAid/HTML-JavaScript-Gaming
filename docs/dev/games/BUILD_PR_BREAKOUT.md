Toolbox Aid
David Quesenberry
03/24/2026
BUILD_PR_BREAKOUT.md

# BUILD_PR — Breakout (Game #4)

## Goal
Build Breakout as Game #4, reusing as much of the validated Pong foundation as makes sense, while keeping architecture clean:
- engine owns reusable systems
- game owns game-specific rules
- no sample leakage
- no broad refactors

## Why Breakout is Next
Breakout is the right follow-on after Pong because it extends the same core loop without a giant jump in complexity:
- paddle control
- ball movement
- collision response
- score progression
- lives / round reset
- arcade feedback

It also adds meaningful new structure:
- bricks
- brick removal
- level layout
- win / lose flow

## Initial Scope
Build the classic core first:
- 1 level layout to start
- score
- lives
- win state
- lose state
- keyboard + gamepad support
- sound hooks through engine audio
- simple HUD

No power-ups in this PR.

## Reuse Strategy
Reuse from Pong where appropriate:
- input contract patterns
- gamepad support path
- ball update structure
- paddle movement rules
- wall collision approach
- sound event integration pattern
- arcade HUD style
- preview asset/index entry pattern

Do not over-abstract.
If a Pong-specific class becomes awkward when stretched to Breakout, do not force reuse.
Rule:
- reuse proven patterns
- extract only clearly reusable logic
- keep game rules local unless reused twice

## Architecture
### Scene
Single main scene:
- BreakoutScene

Scene responsibilities:
- initialize game state
- load level data
- coordinate systems/modules
- handle win/lose transitions
- render through renderer path only
- invoke engine audio by semantic event

### Game-local modules
Suggested:
- BreakoutWorld.js
- BreakoutInputController.js
- BreakoutLevelConfig.js
- BreakoutCollision.js
- BreakoutHud.js

Optional split if needed:
- BreakoutBallSystem.js
- BreakoutBrickSystem.js

Keep this lightweight.

## Gameplay Rules
### Paddle
- horizontal movement only
- keyboard + gamepad
- constrained to arena bounds
- should feel immediate, not floaty

### Ball
- launches from paddle on serve/start
- rebounds off walls, paddle, bricks
- falling below bottom boundary costs a life
- relaunch after life loss
- speed should remain readable and arcade-clean

### Bricks
Start simple:
- one-hit bricks only
- fixed grid
- removed when hit
- score awarded on break

### Lives
- start with 3
- lose one when ball falls below paddle
- game over at 0
- clean reset between lives

### Win condition
- all bricks cleared

### Scoring
Simple and visible:
- points per brick

## Input Model
### Keyboard
Recommended:
- Left/Right Arrows or A/D for paddle
- Space/Enter to launch
- Escape to pause
- M to mute if consistent with Pong/audio behavior

### Gamepad
Through engine input only:
- left stick X
- d-pad left/right
- south button to launch/confirm
- start to pause

No raw browser input in Breakout logic.

## Audio Integration
Use the engine audio service already landed.

Suggested sound events:
- launch
- paddle hit
- wall hit
- brick hit / brick break
- life lost
- level clear
- game over

Keep the first pass minimal and clean.

## Arcade Authenticity Requirement
Breakout should visually and behaviorally feel like the original arcade version, not a modern reinterpretation.

This applies to:
- visuals
- motion
- timing
- sound usage

### Visual Style Requirements
#### Screen Layout
- black background
- centered playfield
- top-aligned brick grid
- bottom paddle
- ball clearly visible at all times

#### Colors
Use simple, solid colors only.
Recommended:
- paddle: white
- ball: white
- bricks: solid color rows
Classic rainbow-style rows are preferred.

Example row colors:
- red
- orange
- yellow
- green

#### Shapes
- rectangles only
- no rounded corners
- no shadows
- no glow effects
- no anti-aliased styling tricks

#### HUD
- minimal
- top of screen
- text only

Display:
- score
- lives

Style:
- simple monospace or arcade-style font
- no UI panels or overlays

### Motion & Physics Feel
#### Ball Behavior
- constant speed
- clean reflection angles
- no floaty or physics-heavy behavior
- no spin mechanics beyond simple reflection

#### Paddle Feel
- immediate response
- no inertia
- no smoothing lag
- tight horizontal control

#### Collisions
- crisp and deterministic
- no particle effects
- no animation delay on brick break

### Sound Usage
- short, sharp tones only
- no layered audio
- no music
- no reverb/effects

### What to Avoid
Do NOT add:
- gradients
- lighting
- easing curves
- particle systems
- modern UI panels
- fancy transitions

If it was not possible on original arcade hardware, do not include it.

## Engine Touch Policy
Only minimal engine changes if clearly justified.
Likely no large engine work should be needed because the repo already has:
- input abstraction
- gamepad support
- audio service
- renderer path
- scene lifecycle

Acceptable small engine changes only if Breakout exposes a genuinely reusable issue.

## File Plan
Suggested structure:

games/
  Breakout/
    index.html
    main.js
    assets/
      preview.svg
    game/
      BreakoutScene.js
      BreakoutWorld.js
      BreakoutInputController.js
      BreakoutLevelConfig.js
      BreakoutHud.js

Likely updates:
- games/index.html
- docs/dev/games/BREAKOUT.md

Possible tests:
- tests/games/BreakoutWorld.test.mjs
- tests/games/BreakoutValidation.test.mjs

## Tests / Validation
Must cover:
- paddle stays in bounds
- ball rebounds correctly off walls, paddle, and bricks
- brick removal works
- score increments correctly
- losing ball removes life
- game over triggers correctly
- level clear triggers correctly
- keyboard/gamepad parity for launch and movement
- no console errors

Good regression targets:
- ball does not tunnel through brick rows at normal speed
- paddle launch/reset flow is stable
- post-life-loss relaunch works consistently

## Acceptance Criteria
Done means:
- Breakout runs standalone
- no console errors
- keyboard works
- gamepad works
- bricks break correctly
- score and lives work
- win and game over states work
- audio hooks work through engine service
- tests pass
- no engine rule violations
- it looks like an arcade game at a glance
- visuals are simple, sharp, and uncluttered
- motion feels immediate and responsive
- nothing visually suggests a modern UI framework

## Non-Goals
Not in this PR:
- power-ups
- multi-ball
- paddle shrink/grow
- brick durability system
- level select
- save/load
- particles
- background music
- fancy menu shell

Keep it surgical.

## Recommended Execution Order
1. scaffold games/Breakout
2. implement world state + paddle + ball
3. add brick grid and collision
4. add score/lives/win/lose flow
5. wire keyboard + gamepad
6. hook audio events
7. add HUD
8. add tests
9. update games/index.html and docs

## Commit Comment
Build Breakout as Game #4 with reusable engine input/audio integration

## Notes for Codex
- Keep the change focused on Breakout only
- Reuse Pong-era patterns only when they stay clean
- Maintain classic arcade visual and motion style: solid colors, no gradients or effects, rectangular geometry only, minimal HUD, and immediate input/physics response consistent with original Breakout
- Do not refactor unrelated games, engine areas, or sample helpers
