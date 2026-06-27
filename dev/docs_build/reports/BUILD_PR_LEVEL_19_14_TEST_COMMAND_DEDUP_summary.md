# Test Command Deduplication

## Result
Removed redundant test execution path.

## Standard
node ./scripts/run-node-tests.mjs is now canonical.

## Overlap Confirmed
- `npm test` resolves to `node ./scripts/run-node-tests.mjs` via `package.json`.
- Canonical guidance was normalized in active Level 19 BUILD/PLAN docs to avoid duplicate command instructions.
