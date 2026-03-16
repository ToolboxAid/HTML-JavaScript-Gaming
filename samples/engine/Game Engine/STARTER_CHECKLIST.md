# Game Starter Checklist

Use this checklist after copying the Game Engine sample into a new game folder.

## Setup
- [ ] Rename copied folder and sample references in local `README.md`
- [ ] Rename page title and on-screen header in `index.html`
- [ ] Update canvas/fullscreen/perf config in `global.js`
- [ ] Set a game-specific debug flag in `game.js`
- [ ] Copy `TODO-template.txt` to your local `todo.txt` and adapt items

## Architecture
- [ ] Keep state constants/handlers organized in `game.js`
- [ ] Keep shared state-screen rendering in `gameStateUi.js`
- [ ] Keep UI rendering separate from state transitions
- [ ] Keep reusable helpers in engine modules, not per-game copies

## Safety and Lifecycle
- [ ] Initialize owned resources in `onInitialize()`
- [ ] Release owned resources in `onDestroy()`
- [ ] Verify restart/reset clears state deterministically

## Validation
- [ ] Run browser smoke pass (load, input, pause/resume, restart)
- [ ] Run browser tests from `tests/testRunner.html` when needed
- [ ] Run visual-regression checks after state-screen UI changes
- [ ] Confirm no unexpected console errors/warnings
- [ ] Confirm debug logs are opt-in only
