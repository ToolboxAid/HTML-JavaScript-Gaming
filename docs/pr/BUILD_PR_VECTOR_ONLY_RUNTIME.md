# BUILD_PR_VECTOR_ONLY_RUNTIME

## Purpose
Implement the vector-only runtime hardening defined in PLAN_PR_VECTOR_ONLY_RUNTIME.

## Build Scope
- remove active sprite fallback dependency from the Asteroids demo runtime/package path
- update visual preference contracts from vector-preferred/sprite-fallback to vector-only
- update validation rules and demo tests to enforce vector-only requirements
- preserve strict packaging, runtime, debug, profiler, export, and publishing flows
- preserve deterministic behavior and stable runtime handoff
- avoid engine core API changes

## Required Contracts
- `vector.asteroids.ship` is required
- `vector.asteroids.asteroid.large` is required
- `vector.asteroids.asteroid.medium` is required
- `vector.asteroids.asteroid.small` is required
- `vector.asteroids.ui.title` is required where title vector treatment is configured
- `sprite.asteroids-demo` must not be required for packaged runtime success
- rollback guidance may remain documented but not as active packaged dependency
- runtime handoff remains `games/Asteroids/main.js#bootAsteroids`
- no engine core APIs are changed

## Likely Files
- `tools/shared/asteroidsPlatformDemo.js`
- `tools/shared/projectAssetValidation.js`
- `tools/shared/projectPackaging.js`
- `tests/games/AsteroidsPlatformDemo.test.mjs`
- Asteroids demo vector asset/config references as needed
- docs/dev reports
- no engine core API files

## Implemented Files
- `tools/shared/asteroidsPlatformDemo.js`
- `tools/shared/projectAssetValidation.js`
- `tools/shared/projectPackaging.js`
- `tests/games/AsteroidsPlatformDemo.test.mjs`
- `docs/dev/reports/vector_only_runtime_validation.txt`

## Build Notes
- Removed `sprite.asteroids-demo` from the active Asteroids demo registry, packaging roots, packaged asset list, and runtime asset source map.
- Hardened the demo contract so required vector IDs are explicit and the demo is not ready if any required vector is missing or if `sprite.asteroids-demo` reappears as an active packaged/runtime dependency.
- Preserved runtime handoff at `games/Asteroids/main.js#bootAsteroids`.
- Kept rollback guidance documented historically in demo metadata and reporting without leaving sprite fallback active in the package/runtime baseline.
- Preserved deterministic validation, packaging, runtime, debug, profiler, export, and publishing behavior.

## Verification Expectations
- node checks pass on updated shared/demo files
- Asteroids demo tests pass
- packaging summary shows vector-only asset baseline
- runtime summary shows ready state
- debug/profiler/publishing remain ready

## Verification
- `node --check tools/shared/asteroidsPlatformDemo.js`
- `node --check tests/games/AsteroidsPlatformDemo.test.mjs`
- `node ./scripts/run-node-tests.mjs`
- Result: `107/107` explicit `run()` tests passed.

## Validation Summary
- Demo status: ready
- Validation: valid with `0` blocking findings
- Packaging: ready with `12` assets and `9` dependencies
- Runtime: ready with `12` loaded assets
- Debug: `12` nodes and `9` edges
- Publishing: ready with `5` release targets

## Manual Validation Checklist
1. Packaged runtime no longer depends on `sprite.asteroids-demo`.
2. Validation enforces vector-only requirements.
3. Demo reaches ready state with vector-only assets.
4. Gameplay loop remains intact.
5. Deterministic output remains stable across repeated runs.
6. Export and publishing remain ready.
7. No engine core APIs are changed.

## Approved Commit Comment
build(vector-runtime): harden asteroids demo to vector-only runtime path

## Next Command
APPLY_PR_VECTOR_ONLY_RUNTIME
