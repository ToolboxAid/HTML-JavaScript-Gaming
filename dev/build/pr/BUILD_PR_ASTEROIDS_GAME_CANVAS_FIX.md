# BUILD_PR_ASTEROIDS_GAME_CANVAS_FIX

## Summary
Apply a surgical test-only fix to `tests/games/AsteroidsValidation.test.mjs` so the Asteroids boot path can resolve `#game` inside the Node test runner.

## File targets
- `tests/games/AsteroidsValidation.test.mjs`
- optionally `tests/tools/VectorNativeTemplate.test.mjs`

## Implementation rules
1. Inspect the real source around the current failing call site in `AsteroidsValidation.test.mjs`.
2. Keep the existing `run` export contract expected by `tests/run-tests.mjs`.
3. Before the failing `bootAsteroidsNew(...)` call, ensure the active `document` responds to:
   - `getElementById('game')` with a non-null canvas-like object
4. The canvas shim should only implement what the Asteroids boot path actually needs.
5. Restore any global overrides after the test section completes.
6. Avoid any broad or file-wide rewrites.
7. Do not modify `games/Asteroids/index.js` for this fix.

## Validation
Run:

```bash
npm test --ignore-scripts > output.txt
```

Then confirm:
- no `Missing #game canvas element`
- `PASS AsteroidsValidation`

If the suite advances to a different failure, stop there and report the new first failure.

## Non-goals
- shared extraction guard remediation
- launch-smoke tuning
- game runtime refactors
