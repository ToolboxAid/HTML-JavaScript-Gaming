# PLAN_PR_ASTEROIDS_GAME_CANVAS_FIX

## Goal
Fix the current `npm test --ignore-scripts` blocker in `tests/games/AsteroidsValidation.test.mjs` where `bootAsteroidsNew(...)` throws:

`Missing #game canvas element`

## Scope
- `tests/games/AsteroidsValidation.test.mjs`
- optionally `tests/tools/VectorNativeTemplate.test.mjs` only if the path assertion is still stale in the current branch

## Required behavior
- Preserve the existing Asteroids test intent and assertions
- Preserve the module export contract expected by `tests/run-tests.mjs`
- Do **not** replace the whole file
- Do **not** change production game code in `games/Asteroids/index.js`
- Do **not** introduce browser-only DOM setup such as direct `document.body.innerHTML` unless the test already has a DOM implementation
- Add the minimum Node-safe shim required so `document.getElementById('game')` returns a canvas-like object during the boot call

## Acceptance criteria
1. `npm test --ignore-scripts` no longer fails with:
   `Missing #game canvas element`
2. The fix is test-only
3. Existing passing Asteroids tests remain passing
4. If VectorNativeTemplate still expects `templates/vector-native-arcade/`, update it to `tools/templates/vector-native-arcade/`

## Notes for implementation
The current failure stack is:

- `bootAsteroidsNew (...) games/Asteroids/index.js:116:31`
- `run (...) tests/games/AsteroidsValidation.test.mjs:152:37`

The likely issue is that the test is running in plain Node and needs a minimal stub for:
- `globalThis.document`
- `document.getElementById('game')`
- a canvas-like object with the methods actually used by Asteroids boot/setup

The shim must be installed immediately before the boot path and restored afterward.
