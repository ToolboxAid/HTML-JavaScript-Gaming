Toolbox Aid
David Quesenberry
03/24/2026
BUILD_PR_SPACE_INVADERS.md

# BUILD_PR — Space Invaders

## Goal
Build Space Invaders as a game-track entry under games/, not samples/.

This PR should create a classic-faithful implementation with:
- original-feeling player cannon movement
- original-feeling alien formation march
- edge-hit reverse and descend behavior
- player shooting with original-style discipline
- alien shooting
- wave progression
- score
- lives
- game over
- minimal arcade-authentic presentation

## Critical Placement Rule
This PR MUST create its files under:

games/SpaceInvaders/

Do NOT place this under samples.
This belongs under the games track.

## Original-Faithful Rule
This game should be built as close to the original arcade game as possible.

Prioritize:
- original gameplay feel
- original pacing
- original controls
- original enemy movement behavior
- original shot discipline
- original screen layout
- original visual simplicity
- original sound usage

Do NOT modernize the game unless explicitly required for browser/runtime practicality.

## Existing Repo Constraints
Use the existing sound effects already present in:

/SpaceInvaders/assets/fx

Do not replace them with generated tones unless a specific gap must be filled.

Also:
- there is an old classes folder in the repo
- do NOT delete the old classes folder
- do NOT do cleanup-by-deletion outside the approved scope

## Scope
Include the original arcade core:
- player cannon at bottom
- left/right movement
- player fire
- marching alien formation
- edge hit -> reverse direction and descend
- alien fire
- score
- lives
- wave clear -> next wave
- game over
- simple HUD
- classic sound hooks using the existing Space Invaders fx assets

## First-Pass Inclusion Recommendation
Recommended to include in first pass if it stays clean:
- bunkers / shields
- mystery ship / UFO

If that risks scope blowup, keep first pass to:
- player
- aliens
- shots
- score/lives
- wave loop

However, original-faithful direction means bunkers are strongly preferred if they can be added without destabilizing the PR.

## Controls

### Keyboard
- Left / Right or A / D = move
- Space = fire
- P = pause / resume
- M = mute if audio is already wired through game/engine behavior

Do NOT use Escape for pause.

### Gamepad
- stick or d-pad = move
- south button = fire
- start = pause / resume

## Visual Style
Keep presentation as close to the original arcade feel as possible:
- black background
- crisp simple alien rows
- simple player cannon
- simple score/lives HUD
- minimal color use consistent with classic style
- no gradients
- no glow
- no modern UI panels
- no decorative effects

## Audio
Use the existing sound effects already available in:
/SpaceInvaders/assets/fx

Sound usage should stay faithful and minimal:
- player shot
- alien movement cadence if available
- hit/explosion
- life lost
- mystery ship if included

Do not create new audio direction unless necessary.
Do not remove or replace the existing fx folder.

## Architecture

### Scene
Single main scene:
- SpaceInvadersScene

### Game-local modules
Suggested:
- SpaceInvadersScene.js
- SpaceInvadersWorld.js
- SpaceInvadersFormation.js
- SpaceInvadersProjectiles.js
- SpaceInvadersHud.js
- SpaceInvadersAudio.js

Optional:
- SpaceInvadersBunkers.js
- SpaceInvadersMysteryShip.js

Keep the game-local structure clean and readable.

## Reuse Strategy
Reuse where clean:
- input path
- audio service integration pattern if appropriate
- scene flow
- HUD conventions
- preview/index entry pattern

Do not force unrelated reuse from Pong/Breakout if it makes Space Invaders less faithful.

## Engine Touch Policy
Likely no major engine changes should be needed.

Use existing engine capabilities:
- renderer
- input abstraction
- scene lifecycle
- audio integration path already established

Only introduce tiny engine changes if clearly justified and reusable.

## File Plan

games/SpaceInvaders/
  index.html
  main.js
  assets/
    preview.svg
    fx/
  game/
    SpaceInvadersScene.js
    SpaceInvadersWorld.js
    SpaceInvadersFormation.js
    SpaceInvadersProjectiles.js
    SpaceInvadersHud.js
    SpaceInvadersAudio.js

Likely updates:
- games/index.html
- docs/dev/games/SPACE_INVADERS.md

Possible tests:
- tests/games/SpaceInvadersWorld.test.mjs
- tests/games/SpaceInvadersValidation.test.mjs

## games/index.html Placement
Place Space Invaders under the classic arcade grouping in games/index.html.

Be explicit:
- Space Invaders belongs in games
- not samples
- preserve the grouped structure already present in games/index.html

## Tests / Validation
Must cover:
- player movement bounds
- player shot creation and limits
- alien formation horizontal march
- edge-hit reverse and descend behavior
- alien removal on hit
- wave clear progression
- life loss behavior
- game over behavior
- no console errors

Good regression targets:
- player cannot spam beyond intended shot discipline
- alien formation remains synchronized
- descend/reverse happens consistently
- repeated wave resets remain stable
- audio hooks do not break when fx files are present/missing
- no NaN/infinite positions

## Acceptance Criteria
Done means:
- Space Invaders runs standalone
- files live under games/SpaceInvaders
- no console errors
- player movement and shooting work
- alien formation behaves like the original
- score/lives/wave/game-over flow work
- existing fx assets are used from /SpaceInvaders/assets/fx where applicable
- old classes folder remains untouched
- games/index.html includes Space Invaders in the correct grouped arcade section
- tests pass
- no engine rule violations
- overall feel is as close to the original arcade game as possible

## Non-Goals
Not in this PR unless explicitly approved:
- reimagined mechanics
- modern UI overlays
- persistent high score storage
- multiplayer modes
- touch/mobile controls
- flashy particle systems
- visual modernization
- deletion of legacy folders/classes

Keep it focused on a faithful classic implementation.

## Recommended Execution Order
1. inspect existing games/SpaceInvaders structure and preserve assets/folders already present
2. scaffold or update game-local files without deleting legacy classes folder
3. implement player movement and fire rules
4. implement alien formation march/reverse/descend
5. add hit/removal, score, lives, and wave flow
6. wire existing fx assets from /SpaceInvaders/assets/fx
7. update games/index.html
8. add tests
9. update docs

## Commit Comment
Build Space Invaders as a classic-faithful game using existing fx assets

## Notes for Codex
- This belongs under games/SpaceInvaders, not samples
- Repeat: do NOT place this under samples
- Use the existing sound effects in /SpaceInvaders/assets/fx
- Do NOT delete the old classes folder
- Keep the game as close to the original arcade version as possible
