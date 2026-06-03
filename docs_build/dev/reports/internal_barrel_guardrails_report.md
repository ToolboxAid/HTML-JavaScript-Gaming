# PR_26140_079 Internal Barrel Guardrails Report

## Scope
- Added `toolbox/dev/checkInternalBarrelGuard.mjs`.
- Added `toolbox/dev/checkInternalBarrelGuard.baseline.json`.
- Added `npm run check:internal-barrel-guard`.
- No schema files were changed.
- No sample JSON files were changed.
- No runtime files were removed.

## Blocked Patterns
- New internal pass-through files under `src/**`, `samples/shared/**`, or `toolbox/**` whose meaningful source is only `export ... from` re-exports.
- New imports or export-from statements that target internal `/index.js` barrel files.

## Allowed Patterns
- Existing legacy barrel debt listed in `toolbox/dev/checkInternalBarrelGuard.baseline.json`.
- Game entrypoints such as `games/*/index.js`.
- Sample entrypoints such as `samples/phase-*/****/index.js`.
- Tool/browser entrypoints under `toolbox/**/index.js` when the target is an actual launch file and not a pass-through barrel.

## Ignored Paths
- `node_modules/**`
- `.git/**`
- `tmp/**`
- `docs_build/archive/**`
- `docs_build/dev/reports/**`
- `tests/results/**`
- minified JavaScript files

## Current Baseline
- Existing baseline violations: 35
- Baseline is intentionally used so this PR blocks new barrel regressions without expanding scope into unrelated runtime cleanup.

## Validation
- PASS: `node --check toolbox/dev/checkInternalBarrelGuard.mjs`
- PASS: `node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('package.json','utf8')); JSON.parse(fs.readFileSync('toolbox/dev/checkInternalBarrelGuard.baseline.json','utf8')); console.log('PASS JSON parse package and baseline');"`
- PASS: `npm run check:internal-barrel-guard`
- PASS: `npm run test:workspace-v2` passed 59 tests.
- PASS: schema/sample JSON audit found no changed schema files and no changed sample JSON files.

## Full Samples Smoke Test
- Skipped. This PR adds a repository validation guard and package script only; it does not change sample loader behavior.

## Manual Validation Notes
- Run `npm run check:internal-barrel-guard`.
- Expected pass behavior: current repo passes with `new_violations=0`.
- Expected fail behavior: adding a new internal pass-through barrel or importing a new internal `/index.js` barrel reports `INTERNAL_BARREL_GUARD_FAILED`.
