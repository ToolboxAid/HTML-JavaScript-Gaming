# PR_26152_258 Engine V2 State Machine Runtime

## Scope

- Added manifest-driven state transition processing for object, scene, UI, door, interaction, and combat state scopes.
- No game-specific state logic.
- No Tools, Samples, Marketplace, or Publishing changes.

## Files

- `src/engine/runtime/engineV2StateMachineRuntime.js`
- `tests/engine/EngineV2StateMachineRuntime.test.mjs`
- `tests/engine/EngineV2FeatureCompleteFixture.mjs`

## Validation

- PASS: `node tests/engine/EngineV2StateMachineRuntime.test.mjs`

## Notes

- Invalid state scopes reject visibly.
- Condition-gated transitions reject when required conditions are not matched.
