# Game Engine Template Changelog

## 1.3.1 - 2026-03-15
- Added controller `Start`/`Select` support to the starter attract, game-over, and pause flow.
- Updated starter copy and docs to reflect the controller-capable template flow.

## 1.3.0 - 2026-03-15
- Extracted shared state-screen rendering helpers into `gameStateUi.js`.
- Updated starter docs/checklists to include the `gameStateUi.js` split.

## 1.2.0 - 2026-03-15
- Slimmed the sample shell, runtime wiring, config, README, and local todo notes.
- Removed template-stale player-select config and kept play-screen styling centralized in `global.js`.
- Simplified state-handler wiring in `game.js` and tightened helper usage in `gameStates.js`.
- Removed noisy `swapPlayer()` console logging from shared `engine/game/gameUtils.js`.

## 1.1.0 - 2026-03-15
- Centralized sample UI theme, safe-area, and performance settings in `global.js`.
- Restyled state screens with themed panels and aligned stage layout helpers.
- Made the performance overlay opt-in via `?perf` and added safe-area layout guides via `?layout`.
- Documented the visual regression and layout-debug workflow.

## 1.0.0 - 2026-03-15
- Split starter logic into `game.js`, `gameStates.js`, and `gameInput.js`.
- Replaced state `switch` branching with a `stateHandlers` map.
- Centralized game UI text/config in `global.js`.
- Added starter docs and checklist files.
- Moved browser test runner to shared `tests/testRunner.html`.
