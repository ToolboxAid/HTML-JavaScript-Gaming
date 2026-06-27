# PR_26140_072b Phase17 Browser-Root Test Resolution

## Scope
- Fixed `tests/runtime/Phase17DebugOverlayBottomRightPosition.test.mjs` only.
- Did not change sample runtime code.
- Did not change `src/engine` runtime code.
- Did not change schemas.
- Did not touch sample JSON.
- Did not run PR_26140_073.

## Change Summary
- Added a Node `registerHooks` resolver in the Phase17 test for browser-root imports:
  - `/src/`
  - `/games/`
  - `/toolbox/`
  - `/samples/`
- Converted the Phase17 sample imports from static imports to dynamic imports after the resolver is registered.
- Added direct-run execution so `node tests/runtime/Phase17DebugOverlayBottomRightPosition.test.mjs` runs the assertions instead of only checking module load.

## Why
The PR_26140_072 classification showed the test failed because Node resolved browser-root sample imports such as `/src/engine/scene/Scene.js` as filesystem-root paths like `C:\src\engine\scene\Scene.js`.

The main node test runner already registers equivalent browser-root aliases in `scripts/run-node-tests.mjs`. This PR applies that same import-resolution pattern locally to the focused Phase17 test so it can run directly under Node.

## PR_26140_072 Debug Barrel Cleanup Confirmation
- Active-code scan found no remaining imports of:
  - `src/engine/debug/index.js`
  - `src/engine/debug/inspectors/index.js`
  - `src/engine/debug/network/index.js`
  - `src/engine/debug/standard/threeD/index.js`
- The four targeted debug index barrel files remain deleted.

## Validation
- PASS: `node tests/runtime/Phase17DebugOverlayBottomRightPosition.test.mjs`
- PASS: `node --check tests/runtime/Phase17DebugOverlayBottomRightPosition.test.mjs`
- PASS: `npm run test:workspace-v2`
  - 59 passed.
- PASS: PR_26140_072 debug barrel cleanup confirmation.

## Not Run
- PR_26140_073 was not run.
- Full samples smoke test was not run.

## Delta ZIP
- `tmp/PR_26140_072b-fix-phase17-browser-root-test-resolution_delta.zip`
