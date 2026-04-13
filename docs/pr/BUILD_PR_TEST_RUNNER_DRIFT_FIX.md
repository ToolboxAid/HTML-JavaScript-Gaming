# BUILD_PR_TEST_RUNNER_DRIFT_FIX

## Scope
Test-only corrections for the current `npm test --ignore-scripts` failures.

## Files to Inspect
- `tests/run-tests.mjs`
- `tests/games/AsteroidsValidation.test.mjs`
- `games/Asteroids/index.js`
- `tests/tools/VectorNativeTemplate.test.mjs`

## Implementation Steps

### 1. Confirm runner contract
Inspect `tests/run-tests.mjs` and confirm the expected export shape:
- named `run` imports
- no default-export fallback expected

Then normalize `tests/games/AsteroidsValidation.test.mjs` to match that contract.

### 2. Repair AsteroidsValidation test without changing runtime logic
In `tests/games/AsteroidsValidation.test.mjs`:
- keep the original test body
- export named `run`
- remove any direct module self-execution
- introduce a **minimal local test shim** for whatever `bootAsteroidsNew(...)` touches

Guidelines for the shim:
- create only what the boot path requires
- start from inspection of `games/Asteroids/index.js`
- if boot only needs `document.getElementById('game')`, provide just that
- if canvas context methods are called during boot, stub only those methods
- if `window.requestAnimationFrame` or event listeners are touched, stub only those
- wrap setup/teardown around the test body and restore prior globals

### 3. Repair template path expectation
In `tests/tools/VectorNativeTemplate.test.mjs`:
- update only the path expectation regex/string
- preserve the rest of the test

### 4. Keep the patch surgical
- no broad rewrites
- no replacing files with placeholders
- no new dependency unless source inspection proves it is already expected

## Suggested Edit Principles
- Prefer exact-match regex/string updates over test rewrites
- Prefer local helper functions inside the test only if already consistent with surrounding style
- Preserve assertion intent; only adapt to current repo shape

## Validation Commands
```bash
npm test --ignore-scripts
```

If still failing, continue only with the next immediate red test caused by this same drift set. Do not scope-creep into unrelated refactors.

## Expected Outcome
- `AsteroidsValidation.test.mjs` loads under the custom node test runner
- Asteroids boot no longer fails on missing DOM globals
- `VectorNativeTemplate.test.mjs` matches current template location
