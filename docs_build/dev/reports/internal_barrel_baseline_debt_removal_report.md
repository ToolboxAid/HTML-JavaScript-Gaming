# PR_26140_080 Internal Barrel Baseline Debt Removal Report

## Scope
- Removed the 35 existing entries from `toolbox/dev/checkInternalBarrelGuard.baseline.json`.
- Replaced active imports from remaining internal index barrels with direct canonical imports.
- Moved `src/engine/components/index.js` implementation to `src/engine/components/Components.js`.
- Removed these internal barrel/pass-through files:
  - `src/engine/components/index.js`
  - `src/engine/combat/index.js`
  - `src/engine/prefabs/index.js`
  - `src/engine/debug/standard/threeD/legacySummarySurface.js`
  - `src/shared/state/contracts.js`
  - `src/shared/state/publicSelectors.js`
  - `toolbox/shared/stringUtils.js`
- Updated shared tests that still imported from `src/shared/**/index.js`.
- Updated `tests/runtime/Phase19OverlayExpansionFramework.test.mjs` stale shared index assertions and added the established Node browser-root import hook so the focused test runs under Node.
- No sample/game entry `index.js` files were removed.
- No schema files were changed.
- No sample JSON files were changed.
- No replacement pass-through files were created.

## Import Ownership Changes
- Component helpers now resolve through `src/engine/components/Components.js`.
- Combat helpers now resolve through `src/engine/combat/Combat.js`.
- Prefab helpers now resolve through `src/engine/prefabs/PrefabFactory.js`.
- Shared state internals now import contract constants directly from `src/shared/contracts/sharedStateContracts.js`.
- Tool vector text sanitization now imports `trimSafe` directly from `src/shared/string/strings.js`.

## Guardrail Result
- `npm run check:internal-barrel-guard` now reports:
  - `baseline_expected=0`
  - `baseline_resolved=0`
  - `new_violations=0`

## Validation
- PASS: targeted `node --check` for all changed existing `.js` and `.mjs` files.
- PASS: targeted import-resolution validation confirmed import targets exist for 26 changed JS/MJS files.
- PASS: `npm run check:internal-barrel-guard`.
- PASS: `tests/combat/Combat.test.mjs`.
- PASS: `tests/shared/SharedFoundationCombinedPass.test.mjs`.
- PASS: `tests/shared/SharedNumberStringIdCloseout.test.mjs`.
- PASS: `tests/shared/GetStateVariantClassification.test.mjs`.
- PASS: `tests/runtime/Phase19OverlayExpansionFramework.test.mjs`.
- PASS: `npm run test:workspace-v2` passed 59 tests.
- PASS: schema/sample JSON audit found no changed schema files and no changed sample JSON files.

## Full Samples Smoke Test
- Skipped. This PR changes import ownership and removes internal barrels; targeted syntax/import checks, affected node tests, and Workspace V2 validation covered the requested scope without broadly changing sample loader behavior.

## Manual Validation Notes
- Run `npm run check:internal-barrel-guard` and confirm zero baseline/new violations.
- Code search should find no active imports from the removed internal barrels.
- Confirm the removed files remain deleted and sample/game entry `index.js` files remain intact.
