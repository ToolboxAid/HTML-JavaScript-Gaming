Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_SPACE_INVADERS_FINAL_POLISH_AND_BUGFIX_PASS.md

# BUILD_PR — Space Invaders Final Polish and Bug Fix Pass

## Scope
- final collision fairness pass
- timing cleanup
- scoring verification
- 1P / 2P flow edge cases
- extra life verification
- wave reset edge cases
- game over / restart edge cases
- sound cleanup
- sprite alignment / HUD polish
- fix UFO loop sound not ending on game over
- player score blinking transition before player swap (10 blinks over 5 seconds)
- bug fixes only, no new major systems

## Engine Classes Used
- CanvasRenderer — rendering entry point only
- InputService — base input handling
- ActionInputService — action-mapped gameplay input
- Scene contract — constructor / init(engine) / update(dt, engine) / render(renderer, engine) / dispose(engine)
- SpriteAtlas — sprite lookup if used by current game assets
- ImageLoader — asset loading if used by current game assets
- Camera2D / CameraSystem — only if used
- World and engine systems — only where consumed through public contracts
- baseLayout.css or shared engine UI layout assets — if used

## Engine Boundary Rules
- Reuse existing engine contracts where available
- Do not duplicate engine behavior locally
- Do not add game-specific logic to engine unless reused beyond Space Invaders
- Only include engine source files in the delta if this PR actually modifies them
- Keep Space Invaders-specific rules in the game layer

## Intent
Stabilize and polish the current Space Invaders implementation without expanding feature scope, while making engine usage explicit like the other samples and games.

## Acceptance Criteria
- No console errors
- Core gameplay remains stable
- 1P and 2P flows behave correctly
- Score and extra life behavior are correct
- Restart and wave transitions are clean
- Timing and collisions feel consistent
- UFO sound stops immediately on game over
- Player swap includes 10 blinks over ~5 seconds before switching
- Engine classes used are documented clearly
- No new architecture violations

## Commit Comment
Polish Space Invaders gameplay flow, timing, scoring, player swap transition, and UFO game over sound cleanup

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_SPACE_INVADERS_FINAL_POLISH_AND_BUGFIX_PASS
