# PLAN_PR_TEST_RUNNER_DRIFT_FIX

## Goal
Restore `npm test --ignore-scripts` to a green state by fixing test-runner drift with **minimal test-only changes** and **no runtime behavior changes**.

## Problem Summary
Current repo state shows three categories of test drift:
1. **Test module contract drift**
   - `tests/run-tests.mjs` imports named `run` exports from test modules.
   - At least one test file was or became incompatible with that contract.
2. **Asteroids validation harness drift**
   - `games/Asteroids/index.js` expects a `#game` canvas.
   - `tests/games/AsteroidsValidation.test.mjs` is executed in plain Node and currently cannot rely on browser DOM globals.
   - A naive `document.body.innerHTML` fix is invalid in this environment because `document` is undefined.
3. **Vector template path drift**
   - `tests/tools/VectorNativeTemplate.test.mjs` expects `templates/vector-native-arcade/`
   - Actual runtime output reports `tools/templates/vector-native-arcade/`

## Constraints
- **Do not** replace entire files with stubs.
- **Do not** change game runtime behavior to satisfy tests.
- **Do not** add heavyweight browser test dependencies unless already present and truly required.
- Preserve the existing custom test runner contract based on named `run` exports.
- Fix only the smallest set of lines needed.

## Required Investigation
Codex must inspect the current source before editing:
- `tests/run-tests.mjs`
- `tests/games/AsteroidsValidation.test.mjs`
- `games/Asteroids/index.js`
- `tests/tools/VectorNativeTemplate.test.mjs`

## Intended Fix Strategy
### A. Re-align test module export contract
- Ensure `tests/games/AsteroidsValidation.test.mjs` exports a named `run`.
- Remove any accidental standalone invocation block such as `run().catch(...)` if present.
- Preserve all existing assertions and setup logic.

### B. Fix Asteroids test harness using a minimal Node-safe DOM shim
- Do **not** use `document.body.innerHTML`.
- Provide only the minimum globals and canvas surface required by `bootAsteroidsNew(...)`.
- Prefer a local shim scoped to the test:
  - `globalThis.document`
  - `globalThis.window` if needed
  - `document.getElementById('game')`
  - minimal fake canvas with only methods/properties actually touched by the boot path
- Restore original globals in `finally`.

### C. Update vector template expectation
- Adjust the expected template path in `tests/tools/VectorNativeTemplate.test.mjs` to match the real repo path:
  - from `templates/vector-native-arcade/`
  - to `tools/templates/vector-native-arcade/`

## Validation Targets
1. `npm test --ignore-scripts`
2. Verify Asteroids validation no longer fails on missing canvas / missing document
3. Verify vector template test matches current output path
4. Confirm no runtime files under `games/` were modified unless strictly necessary for test contract clarity
5. Leave `npm test` guard-remediation work for a separate PR

## Out of Scope
- The 93 shared extraction guard violations
- Refactors to the global test runner beyond the minimum needed
- Converting tests to a full browser environment
