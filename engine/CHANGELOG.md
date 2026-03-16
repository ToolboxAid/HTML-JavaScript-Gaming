# Engine Changelog

Update this file any time a change lands under `engine/`.

## 1.5.0 - 2026-03-16
- Renamed `core/canvas.js` to `core/canvasUtils.js` and updated engine, game, sample, test, and doc references.
- Extracted shared frame-step logic into `animation/animationFrameStepper.js` and clamped finished animations to the last valid frame.
- Added shared input lifecycle and frame-state helpers in `input/inputLifecycle.js` and `input/inputFrameState.js`, including same-frame press/release safety.
- Split shared player-select rendering into `game/gamePlayerSelectUi.js` and made it config-driven and canvas-state-safe.
- Moved fullscreen ownership under `core/fullscreen.js` and updated runtime references to match.

## 1.4.0 - 2026-03-15
- Centralized centered and multiline text handling in `core/canvasText.js`.
- Removed older centering passthroughs from `core/canvasUtils.js`.
- Polished debug logging defaults in `utils/debugLog.js` with compact caller context and cleaner trace behavior.
- Added optional `onResize` support to `core/fullscreen.js` for callback-based redraw flows.

## 1.3.0 - 2026-03-14
- Reduced hot-loop work and allocation churn across the game loop, renderer debug path, object system, gamepad polling, and canvas callbacks.
- Added reusable synthesizer helpers for transport, keyboard maps, audio-context access, time signatures, sound profiles, and score validation.
- Hardened synthesizer and audio cleanup paths, including safer stop behavior and playback-controller teardown.
- Extended `output/midiPlayer.js` cleanup and seek support for sample and tool reuse.

## 1.2.0 - 2026-03-13
- Expanded Node-safe engine coverage across input and physics with a stronger shared test harness.
- Refined debug logging so runtime console output consistently flows through `DebugLog`.
- Stabilized fullscreen lifecycle handling and improved runtime/browser safety guards.
- Continued canonical migration toward `engine/game/`, including `GameCollision` and shared object validation helpers.

## 1.1.0 - 2026-03-12
- Separated runtime responsibilities into focused engine modules for core, game, renderers, physics, animation, lifecycle, and messages.
- Extracted shared helpers for object cleanup, PNG asset state, collision-shape adapters, vector math, and animation state synchronization.
- Added compatibility shims where needed while moving consumers toward clearer canonical module paths.

## 1.0.0 - 2026-03-11
- Established the current shared engine structure used by games, samples, tests, and tools in this repository.

