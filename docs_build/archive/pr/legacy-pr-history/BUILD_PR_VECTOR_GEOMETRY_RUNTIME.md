# BUILD_PR_VECTOR_GEOMETRY_RUNTIME

## Purpose
Implement the first production-ready vector geometry runtime aligned to `docs/reference/architecture-standards/specs/vector_asset_contract.md` so vector-native sample games can consume validated vector assets as runtime-ready geometry without engine core API changes.

## Runtime Scope
- ingest canonical vector asset documents and normalize legacy SVG-bridge vector entries for transition-safe runtime use
- parse and validate supported vector primitives
- provide deterministic translate, rotate, and scale operations
- compute bounds, centers, origins, anchors, and transformed points
- prepare runtime-ready renderables and collision-friendly primitive output
- expose the runtime through packaged asset loading for vector-native template/sample-game flows

## Modules Created
- `tools/shared/vector/vectorGeometryMath.js`
- `tools/shared/vector/vectorAssetContract.js`
- `tools/shared/vector/vectorRenderPrep.js`
- `tools/shared/vectorGeometryRuntime.js`
- `tests/tools/VectorGeometryRuntime.test.mjs`

## Modules Changed
- `tools/shared/vector/vectorAssetBridge.js`
- `tools/shared/projectAssetValidation.js`
- `tools/shared/runtimeAssetLoader.js`
- `tools/shared/vectorNativeTemplate.js`
- `tools/shared/vectorTemplateSampleGame.js`
- `tools/shared/asteroidsPlatformDemo.js`
- `tests/tools/VectorAssetSystem.test.mjs`
- `tests/tools/VectorNativeTemplate.test.mjs`
- `tests/tools/VectorTemplateSampleGame.test.mjs`
- `tests/run-tests.mjs`

## Public And Runtime Boundaries
- `tools/shared/vectorGeometryRuntime.js` is the public shared runtime facade for contract inspection and runtime preparation.
- `tools/shared/vector/vectorAssetContract.js` owns vector contract normalization and validation boundaries.
- `tools/shared/vector/vectorGeometryMath.js` owns pure geometry math and supported SVG path parsing.
- `tools/shared/vector/vectorRenderPrep.js` owns render-prep and collision-oriented output shaping.
- `tools/shared/runtimeAssetLoader.js` remains the packaged runtime entry and now upgrades vector assets into geometry-ready runtime output without modifying engine core APIs.

## Build Notes
- `normalizeSvgToVectorAsset()` now emits contract-aligned vector assets while preserving the existing legacy geometry fields needed by current platform consumers.
- Validation now evaluates vector assets against the contract structure while preserving stable finding families: `INVALID_VECTOR_SOURCE`, `INVALID_VECTOR_GEOMETRY`, and `INVALID_VECTOR_STYLE`.
- Vector-native template, sample-game, and Asteroids demo packaged runtime fixtures now provide real vector asset documents instead of placeholder runtime stubs.
- The packaged runtime bootstrap now surfaces vector assets as `runtimeKind: "vector-geometry"` entries with deterministic renderables, bounds, and collision primitives.

## Validation Performed
- `node --check tools/shared/vector/vectorGeometryMath.js`
- `node --check tools/shared/vector/vectorAssetContract.js`
- `node --check tools/shared/vector/vectorRenderPrep.js`
- `node --check tools/shared/vectorGeometryRuntime.js`
- `node --check tools/shared/vector/vectorAssetBridge.js`
- `node --check tools/shared/projectAssetValidation.js`
- `node --check tools/shared/runtimeAssetLoader.js`
- `node --check tools/shared/vectorNativeTemplate.js`
- `node --check tools/shared/vectorTemplateSampleGame.js`
- `node --check tools/shared/asteroidsPlatformDemo.js`
- `node --input-type=module -e "import('./tests/tools/VectorGeometryRuntime.test.mjs').then((m) => m.run())"`
- `node --input-type=module -e "import('./tests/tools/VectorAssetSystem.test.mjs').then((m) => m.run())"`
- `node --input-type=module -e "import('./tests/tools/VectorNativeTemplate.test.mjs').then((m) => m.run())"`
- `node --input-type=module -e "import('./tests/tools/VectorTemplateSampleGame.test.mjs').then((m) => m.run())"`
- `node --input-type=module -e "import('./tests/games/AsteroidsPlatformDemo.test.mjs').then((m) => m.run())"`
- `node ./scripts/run-node-tests.mjs`

## Validation Summary
- Vector assets parse successfully through the contract runtime and through packaged runtime loading.
- Deterministic transforms produce stable translated, rotated, and scaled point output.
- Bounds and centers compute correctly for polygon and path-backed shapes.
- Supported primitives produce runtime-ready renderables and collision-ready geometry output.
- Vector-native template, vector sample game, and Asteroids platform demo now have a clear runtime integration path through `runtimeAssetLoader`.
- Full repo node test runner passed with `110/110` explicit `run()` tests passing.

## Follow-Up Recommendations
1. Migrate persisted sample/demo `.vector.json` files from legacy bridge shape to canonical contract shape so runtime no longer relies on transitional normalization for checked-in assets.
2. Extend supported path command coverage beyond `M/L/H/V/Z` only when a concrete vector-native consumer requires it and validation can stay fail-fast.
3. Add geometry-runtime-specific debug/profiler surfacing once a downstream vector-native game starts using runtime transforms dynamically.
