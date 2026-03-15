# Game Engine Template Changelog

## 1.2.0 - 2026-03-15
- Slimmed the sample shell, runtime wiring, config, README, and local todo notes.
- Removed template-stale player-select config from the sample and kept play-screen styling config centralized in `global.js`.
- Simplified state-handler wiring in `game.js` and tightened helper usage in `gameStates.js`.
- Removed noisy `swapPlayer()` console logging from shared `engine/game/gameUtils.js`.

## 1.1.0 - 2026-03-15
- Centralized sample UI theme, font, safe-area, and performance settings in `global.js`.
- Restyled state screens with themed panels, typography, and aligned stage layout helpers.
- Made the performance overlay opt-in via `?perf`.
- Added safe-area layout debug guides via `?layout`.
- Documented the visual regression and layout-debug workflow.

## 1.0.0 - 2026-03-15
- Split starter logic into `game.js`, `gameStates.js`, and `gameInput.js`.
- Replaced state `switch` branching with a `stateHandlers` map.
- Centralized game UI text positions and style values in `global.js`.
- Added starter onboarding docs and checklist files.
- Moved browser test runner to shared `tests/testRunner.html`.
