# PR_26140_069 Engine Domain Index Barrel Removal Phase 3

## Summary
- Removed the targeted phase 3 engine domain barrel files:
  - `src/engine/ai/index.js`
  - `src/engine/animation/index.js`
  - `src/engine/automation/index.js`
  - `src/engine/config/index.js`
  - `src/engine/ecs/index.js`
  - `src/engine/entity/index.js`
  - `src/engine/interaction/index.js`
- Replaced active imports from those barrels with direct canonical file imports.
- Kept edits to import wiring only. No runtime logic, sample JSON, game/sample entry removal, replacement barrels, or pass-through shims were added.
- No edits were made under `src/engine/debug/**`, `src/engine/network/**`, or `src/engine/systems/**`.
- `src/engine/core/index.js` remains untouched in this PR.
- `src/engine/release/SettingsSystem.js` received a required import-only update from the config barrel to `src/engine/config/ConfigStore.js` so the config barrel could be deleted.

## Direct Import Mapping
- AI:
  - patrol helpers -> `src/engine/ai/PatrolSystem.js`
  - pathfinding -> `src/engine/ai/GridPathfinding.js`
  - chase/evade steering -> `src/engine/ai/SteeringBehaviors.js`
  - `AIStateController` -> `src/engine/ai/AIStateController.js`
  - group behavior helpers -> `src/engine/ai/GroupBehaviors.js`
- `AnimationController` -> `src/engine/animation/AnimationController.js`
- Automation classes -> their one-class files under `src/engine/automation/`
- `ConfigStore` -> `src/engine/config/ConfigStore.js`
- `World` -> `src/engine/ecs/World.js`
- Entity components -> their one-class files under `src/engine/entity/`
- Interaction helpers -> `src/engine/interaction/InteractionSystem.js`

## Additional Import Validation Repair
- While validating changed-file imports, `tests/final/EditorAutomationSecurityPipeline.test.mjs` surfaced stale imports from removed `tools/shared/editor/index.js` and `tools/shared/pipeline/index.js`.
- Because that test was already touched for automation barrel removal, it was updated with direct canonical imports from the existing editor and pipeline files so the requested changed-file import validation and affected domain test can run cleanly.

## Validation
- PASS: target barrel scan reports `0` active imports/exports from the seven phase 3 barrels.
- PASS: target deletion scan confirms all seven targeted `index.js` files no longer exist.
- PASS: no JSON files changed.
- PASS: `node --check` passed for 42 changed existing JS/MJS files.
- PASS: local import target validation passed for 42 changed existing JS/MJS files.
- PASS: `npm run test:workspace-v2` passed 59/59 tests.
- PASS: targeted affected domain tests passed:
  - `tests/ai/AIBehaviors.test.mjs`
  - `tests/final/EditorAutomationSecurityPipeline.test.mjs`
- PASS: `git diff --check` exited 0. Git emitted advisory line-ending warnings for touched `.mjs` test files only.
- SKIPPED: full samples smoke test, per PR instruction.
