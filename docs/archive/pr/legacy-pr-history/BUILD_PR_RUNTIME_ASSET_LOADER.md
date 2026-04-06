# BUILD_PR_RUNTIME_ASSET_LOADER

## Goal
Implement the strict runtime asset loader defined in `PLAN_PR_RUNTIME_ASSET_LOADER` without changing engine core APIs.

## Implemented Scope
- Added shared strict packaged runtime loader in `tools/shared/runtimeAssetLoader.js`
  - validates the packaged manifest contract before runtime load begins
  - treats the package manifest as the runtime authority for asset enumeration
  - executes deterministic sequential loading using packaged asset order
  - returns stable `idle/loading/ready/failed` runtime loader state
  - fails fast on invalid manifests, missing packaged assets, or loader failures
  - produces runtime bootstrap handoff data for packaged project startup
- Added automated coverage in `tests/tools/RuntimeAssetLoader.test.mjs`
  - valid packaged runtime load reaches ready state
  - repeated loads preserve deterministic order
  - missing packaged asset fails fast with stable reporting
  - invalid packaged manifest fails before runtime readiness
- Registered the new runtime loader coverage in `tests/run-tests.mjs`

## Manual Validation Checklist
1. Valid packaged project loads successfully. `PASS`
2. Repeated loads of unchanged package produce stable load order. `PASS`
3. Missing required packaged asset fails fast. `PASS`
4. Invalid manifest/package contract fails fast. `PASS`
5. Ready state only occurs after all required startup dependencies resolve. `PASS`
6. Loader reports clearly identify failure boundaries. `PASS`
7. Engine core APIs remain unchanged. `PASS`

## Validation Summary
- Syntax checks passed:
  - `node --check tools/shared/runtimeAssetLoader.js`
  - `node --check tests/tools/RuntimeAssetLoader.test.mjs`
- Full Node test suite passed:
  - `node ./scripts/run-node-tests.mjs`

## Scope Guard
- Runtime loading remains limited to strict packaged output.
- Package manifest remains the runtime entry authority.
- Load sequencing remains deterministic and report-oriented.
- Fail-fast behavior remains scoped to invalid packaged runtime input.
- No engine core API files were modified.

## Approved Commit Comment
build(runtime-loader): add strict packaged runtime asset loader

## Next Command
APPLY_PR_RUNTIME_ASSET_LOADER
