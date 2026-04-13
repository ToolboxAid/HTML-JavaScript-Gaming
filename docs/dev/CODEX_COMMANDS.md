MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_TEST_RUNNER_DRIFT_FIX as a docs-following, test-only patch.

Inspect these files first:
- tests/run-tests.mjs
- tests/games/AsteroidsValidation.test.mjs
- games/Asteroids/index.js
- tests/tools/VectorNativeTemplate.test.mjs

Then apply the minimum safe changes needed to restore `npm test --ignore-scripts`:

1. Re-align `tests/games/AsteroidsValidation.test.mjs` with the runner contract:
   - export a named `run`
   - remove any self-executing `run().catch(...)` block if present
   - preserve existing assertions and structure

2. Fix the Asteroids validation environment using a Node-safe local shim:
   - do NOT use `document.body.innerHTML`
   - inspect the boot path and mock only the minimal globals actually touched
   - likely candidates: `globalThis.document`, `document.getElementById('game')`, a minimal fake canvas/context, and possibly `globalThis.window`
   - restore original globals after the test

3. Update `tests/tools/VectorNativeTemplate.test.mjs` so the expected template path matches the current repo output:
   - `tools/templates/vector-native-arcade/`

Constraints:
- no broad rewrites
- no stub file replacement
- no runtime behavior changes in game code unless absolutely required by an already-existing contract mismatch
- no new heavy dependencies

Validate with:
- npm test --ignore-scripts

If there is another failing test afterward, report it separately instead of rolling unrelated fixes into this PR.

NEXT COMMAND:
npm test --ignore-scripts
