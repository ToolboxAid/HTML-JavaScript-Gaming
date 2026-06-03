# PR_26152_260 Engine V2 Effect Runtime

## Scope

- Added manifest-driven particle/effect processing.
- Supported effect types: explosion, dust, snow, rain, fire, smoke, sparkles, hit, and pickup.
- No hard-coded effect behavior.
- No Tools, Samples, Marketplace, or Publishing changes.

## Files

- `src/engine/runtime/engineV2EffectRuntime.js`
- `tests/engine/EngineV2EffectRuntime.test.mjs`
- `tests/engine/EngineV2FeatureCompleteFixture.mjs`

## Validation

- PASS: `node tests/engine/EngineV2EffectRuntime.test.mjs`

## Notes

- Effect requests must reference manifest effect definitions.
- Unsupported effect types reject visibly.
