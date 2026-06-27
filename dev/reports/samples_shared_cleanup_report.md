# PR_26140_078 Samples Shared Cleanup Report

## Scope
- Removed sample-level pass-through utility files in `samples/shared`:
  - `debugConfigUtils.js`
  - `networkDebugUtils.js`
  - `numberUtils.js`
  - `snapshotCloneUtils.js`
- Removed the sample-level `worldSystems.js` barrel.
- Updated sample imports to direct canonical owners:
  - shared debug config from `/src/shared/debug/config.js`
  - shared network debug helpers from `/src/shared/debug/network.js`
  - shared number helpers from `/src/shared/number/numbers.js`
  - shared snapshot clone helper from `/src/shared/runtime/snapshotClone.js`
  - world system classes/functions from `samples/shared/worldSystems/*`
- Updated `tests/samples/SamplesProgramCombinedPass.test.mjs` so its canonical samples/shared list no longer expects removed pass-through files.
- Kept sample entry `index.js` files intact.
- No sample JSON files were changed.
- No schema files were changed.
- No replacement pass-through files or shims were created.

## Validation Notes
- The first focused `SamplesProgramCombinedPass` run exposed an existing UTF-8 BOM in `samples/metadata/samples.index.metadata.json`. Sample JSON was not modified; the test reader now tolerates a leading BOM so the affected sample/shared boundary test can run.

## Validation Results
- PASS: targeted syntax validation for all changed existing `.js` and `.mjs` files using `node --check`.
- PASS: targeted import-resolution validation confirmed import targets exist for 22 changed JS/MJS files.
- PASS: `rg -n "worldSystems\.js|debugConfigUtils\.js|networkDebugUtils\.js|numberUtils\.js|snapshotCloneUtils\.js" samples tests --glob "*.js" --glob "*.mjs" --glob "*.html" --glob "*.css" --glob "!tests/results/**"` returned no active references.
- PASS: `rg -n "^export .* from" samples/shared --glob "*.js"` returned no remaining samples/shared barrel-style re-exports.
- PASS: `node --input-type=module -e "const m = await import('./tests/samples/SamplesProgramCombinedPass.test.mjs'); await m.run(); console.log('PASS SamplesProgramCombinedPass');"`.
- PASS: `npm run test:workspace-v2` passed 59 tests.
- PASS: JSON change audit found no changed `.json` files.

## Full Samples Smoke Test
- Skipped. This PR changes sample import plumbing and sample shared helper ownership; targeted syntax/import validation plus `SamplesProgramCombinedPass` covered the affected sample/shared paths without broadly changing sample loader behavior.

## Manual Validation Notes
- Confirm code search finds no active references to the removed sample shared helper names.
- Confirm the phase 13 world-system samples still import their world-system components from `samples/shared/worldSystems/*`.
- Confirm sample JSON remains untouched.
