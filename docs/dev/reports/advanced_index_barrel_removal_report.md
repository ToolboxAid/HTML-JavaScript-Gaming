# PR_26140_077 Advanced Index Barrel Removal Report

## Scope
- Removed the remaining targeted internal advanced barrels:
  - `src/advanced/promotion/index.js`
  - `src/advanced/state/index.js`
- Replaced active imports from `src/advanced/state/index.js` with direct canonical module imports.
- No schema files were changed.
- No sample JSON files were changed.
- No sample/game entry `index.js` files were removed.
- No replacement pass-through barrels or shims were created.

## Import Updates
- `tests/world/WorldGameStateAuthoritativeScore.test.mjs` now imports state constants, system creation, and registration directly from their owning modules.
- `tests/world/WorldGameStateAuthoritativeHandoff.test.mjs` now imports state constants, system creation, and registration directly from their owning modules.
- `src/shared/state/contracts.js` had a stale reference to the previously removed `src/shared/contracts/index.js`; focused advanced/state validation exposed it. This was repaired with direct exports from `sharedStateContracts.js` and `replayContracts.js` only.

## Validation
- PASS: `node --check src/shared/state/contracts.js`
- PASS: `node --check tests/world/WorldGameStateAuthoritativeScore.test.mjs`
- PASS: `node --check tests/world/WorldGameStateAuthoritativeHandoff.test.mjs`
- PASS: `rg -n "advanced/(promotion|state)/index\.js" --glob "*.js" --glob "*.mjs" --glob "!docs/dev/reports/**" --glob "!tests/results/**"` returned no active references.
- PASS: `Test-Path src/advanced/promotion/index.js; Test-Path src/advanced/state/index.js` returned `False` for both targeted barrels.
- PASS: focused `WorldGameStateAuthoritativeScore` test run.
- PASS: focused `WorldGameStateAuthoritativeHandoff` test run.
- PASS: `npm run test:workspace-v2` passed 59 tests.

## Affected Advanced/State Tests
- `tests/world/WorldGameStateAuthoritativeScore.test.mjs`
- `tests/world/WorldGameStateAuthoritativeHandoff.test.mjs`

## Full Samples Smoke Test
- Skipped. This PR is import-only cleanup plus one stale direct-import repair; it does not broadly impact the sample loader/framework.

## Manual Validation Notes
- Confirm the two targeted advanced barrel files no longer exist.
- Confirm code search shows no active imports from the targeted advanced barrels.
- Confirm Workspace Manager V2 still passes its standard validation gate.
