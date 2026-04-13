MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create a small test-only patch for the current Asteroids failure.

Primary target:
- `tests/games/AsteroidsValidation.test.mjs`

Do the following:
1. Inspect the real file around the current failing call:
   - stack shows `tests/games/AsteroidsValidation.test.mjs:152:37`
2. Preserve the existing structure and assertions.
3. Ensure the file exports the named `run` function expected by `tests/run-tests.mjs`.
4. Immediately before the failing `bootAsteroidsNew(...)` path, install the minimum Node-safe DOM/canvas shim so:
   - `globalThis.document` exists for this test scope
   - `document.getElementById('game')` returns a canvas-like object
   - the returned object supports the canvas methods/properties Asteroids boot actually uses
5. Restore globals after the test scope finishes.
6. Do not use a browser-only approach that assumes a full DOM implementation.
7. Do not edit `games/Asteroids/index.js`.

Secondary target, only if still failing in the current branch:
- `tests/tools/VectorNativeTemplate.test.mjs`
  - update expected path from `templates/vector-native-arcade/` to `tools/templates/vector-native-arcade/`

Success criteria:
- `npm test --ignore-scripts > output.txt`
- the first failure is no longer `Missing #game canvas element`
- `PASS AsteroidsValidation` appears
- stop after the first new failure, if any, and report it
