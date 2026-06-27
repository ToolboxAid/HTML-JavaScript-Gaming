# PR_26152_264 Engine V2 Config Driven Proof Scene

## Scope

- Added config-driven proof scene coordinator.
- Manifest loads the existing manifest-driven playable scene.
- Validates gameplay integration for terrain, objects, environment, inventory, combat, objectives, UI, win/lose outcomes, and save/load/continue.
- No samples.
- No tool dependency.
- No hard-coded game behavior.

## Files

- `src/engine/runtime/engineV2ConfigDrivenProofScene.js`
- `tests/engine/EngineV2ConfigDrivenProofScene.test.mjs`
- `tests/engine/EngineV2FeatureCompleteFixture.mjs`

## Validation

- PASS: `node tests/engine/EngineV2ConfigDrivenProofScene.test.mjs`

## Notes

- Proof scene rejects when Engine V2 manifest extension data is missing.
- Proof scene rejects when save/load validation fails.
