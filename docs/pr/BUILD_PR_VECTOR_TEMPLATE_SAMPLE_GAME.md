# BUILD_PR_VECTOR_TEMPLATE_SAMPLE_GAME

## Purpose
Implement a clean sample game built from the accepted `templates/vector-native-arcade/` baseline,
proving that the reusable vector-native template can produce a standalone playable project without
sprite fallback and without engine core API changes.

## Build Scope
- create a standalone sample game from the vector-native template baseline
- keep the sample game small, playable, and demo-ready
- use first-class vector assets as the required visual contract
- preserve strict validation, packaging, runtime, CI, export, and publishing compatibility
- keep the sample reusable as proof that the template is not Asteroids-specific
- avoid engine core API changes

## Suggested Target
```text
games/vector-arcade-sample/
```

## Required Contracts
- vector assets are the only active visual runtime dependency
- no sprite fallback is packaged as active runtime dependency
- registry, dependency graph, validation, packaging, and runtime all recognize the sample cleanly
- debug/profiler/export/publishing remain compatible
- deterministic behavior remains stable
- no engine core APIs are changed

## Likely Files
- `games/vector-arcade-sample/*`
- template-derived vector assets/config/runtime files
- validation/packaging/runtime/debug/profiler reports
- docs/dev reports
- no engine core API files

## Implemented Files
- `games/vector-arcade-sample/index.html`
- `games/vector-arcade-sample/main.js`
- `games/vector-arcade-sample/README.md`
- `games/vector-arcade-sample/assets/palettes/vector-native-primary.palette.json`
- `games/vector-arcade-sample/assets/vectors/template-player.vector.json`
- `games/vector-arcade-sample/assets/vectors/template-obstacle-large.vector.json`
- `games/vector-arcade-sample/assets/vectors/template-obstacle-small.vector.json`
- `games/vector-arcade-sample/assets/vectors/template-title.vector.json`
- `games/vector-arcade-sample/assets/vectors/template-hud.vector.json`
- `games/vector-arcade-sample/assets/tilemaps/template-ui.tileset.json`
- `games/vector-arcade-sample/assets/tilemaps/template-arena.tilemap.json`
- `games/vector-arcade-sample/assets/parallax/template-backdrop.parallax.json`
- `games/vector-arcade-sample/assets/parallax/template-backdrop.svg`
- `games/vector-arcade-sample/config/sample.project.json`
- `games/vector-arcade-sample/runtime/bootstrap.runtime.json`
- `games/vector-arcade-sample/docs/STARTER_GUIDE.md`
- `games/vector-arcade-sample/docs/ROLLBACK_NOTES.md`
- `tools/shared/vectorTemplateSampleGame.js`
- `tests/tools/VectorTemplateSampleGame.test.mjs`
- `tests/run-tests.mjs`

## Build Notes
- Built `games/vector-arcade-sample/` as a standalone sample derived from `templates/vector-native-arcade/`.
- Kept vector assets as the only active visual runtime dependency.
- Preserved strict validation, packaging, runtime, debug, profiler, export, and publishing compatibility through a shared sample-game verifier.
- Added a sample-local runtime entry at `games/vector-arcade-sample/main.js#bootVectorArcadeSample` without changing engine core APIs.

## Verification
- `node --check tools/shared/vectorTemplateSampleGame.js`
- `node --check games/vector-arcade-sample/main.js`
- `node --check tests/tools/VectorTemplateSampleGame.test.mjs`
- `node ./scripts/run-node-tests.mjs`
- Result: `109/109` explicit `run()` tests passed.

## Validation Summary
- Sample status: ready
- Validation: valid with `0` blocking findings
- Packaging: ready with `10` assets and `8` dependencies
- Runtime: ready with `10` loaded assets
- Debug: `10` nodes and `8` edges
- Publishing: ready with `5` release targets

## Verification Expectations
- sample validates successfully
- sample packages successfully
- runtime reaches ready state
- debug graph shows vector-native sample assets
- profiler captures deterministic sample data
- export and publishing remain ready

## Manual Validation Checklist
1. Sample game is created from the vector-native template baseline.
2. Validation passes with no blocking findings.
3. Packaging succeeds without sprite fallback.
4. Runtime reaches ready state.
5. Gameplay/sample loop is demonstrable.
6. Debug and profiler surfaces reflect sample participation.
7. Export and publishing remain ready.
8. No engine core APIs are changed.

## Approved Commit Comment
build(sample-game): add standalone game from vector-native template

## Next Command
APPLY_PR_VECTOR_TEMPLATE_SAMPLE_GAME
