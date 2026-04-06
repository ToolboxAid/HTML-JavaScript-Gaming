# BUILD_PR_VECTOR_NATIVE_TEMPLATE

## Purpose
Implement a reusable vector-native arcade template that preserves the accepted strict platform boundaries and uses first-class vector assets as the required visual contract.

## Build Scope
- create `templates/vector-native-arcade/` as the reusable starter path
- require first-class vector assets for player, obstacle, title, and HUD baseline visuals
- preserve strict validation, packaging, runtime, CI, export, and publishing boundaries
- avoid reintroducing sprite fallback as an active runtime dependency
- keep the template reusable for future vector-led games
- avoid engine core API changes

## Implemented Files
- `templates/vector-native-arcade/README.md`
- `templates/vector-native-arcade/assets/palettes/vector-native-primary.palette.json`
- `templates/vector-native-arcade/assets/vectors/template-player.vector.json`
- `templates/vector-native-arcade/assets/vectors/template-obstacle-large.vector.json`
- `templates/vector-native-arcade/assets/vectors/template-obstacle-small.vector.json`
- `templates/vector-native-arcade/assets/vectors/template-title.vector.json`
- `templates/vector-native-arcade/assets/vectors/template-hud.vector.json`
- `templates/vector-native-arcade/assets/tilemaps/template-ui.tileset.json`
- `templates/vector-native-arcade/assets/tilemaps/template-arena.tilemap.json`
- `templates/vector-native-arcade/assets/parallax/template-backdrop.parallax.json`
- `templates/vector-native-arcade/assets/parallax/template-backdrop.svg`
- `templates/vector-native-arcade/config/template.project.json`
- `templates/vector-native-arcade/runtime/bootstrap.runtime.json`
- `templates/vector-native-arcade/docs/STARTER_GUIDE.md`
- `templates/vector-native-arcade/docs/ROLLBACK_NOTES.md`
- `tools/shared/vectorNativeTemplate.js`
- `tests/tools/VectorNativeTemplate.test.mjs`
- `tests/run-tests.mjs`

## Build Notes
- Added a reusable template definition and verifier in `tools/shared/vectorNativeTemplate.js`.
- The template uses a vector-only visual contract with required vector IDs for player, obstacles, title, and HUD starter content.
- The template preserves strict validation, packaging, runtime, debug, profiler, CI, export, and publishing flows.
- The template does not package or load sprite fallback assets as part of the active runtime baseline.
- Runtime bootstrap remains compatible with `games/Asteroids/main.js#bootAsteroids` as a starter seam without modifying engine core APIs.

## Verification
- `node --check tools/shared/vectorNativeTemplate.js`
- `node --check tests/tools/VectorNativeTemplate.test.mjs`
- `node ./scripts/run-node-tests.mjs`
- Result: `108/108` explicit `run()` tests passed.

## Validation Summary
- Template status: ready
- Validation: valid with `0` blocking findings
- Packaging: ready with `10` assets and `8` dependencies
- Runtime: ready with `10` loaded assets
- Debug: `10` nodes and `8` edges
- CI: pass
- Publishing: ready with `5` release targets

## Manual Validation Checklist
1. Template exists at `templates/vector-native-arcade/`.
2. Required vector asset categories are present.
3. Validation passes with no blocking findings.
4. Packaging remains deterministic.
5. Runtime reaches ready state.
6. CI, export, and publishing remain ready.
7. No sprite fallback is required as an active runtime dependency.
8. No engine core APIs are changed.
