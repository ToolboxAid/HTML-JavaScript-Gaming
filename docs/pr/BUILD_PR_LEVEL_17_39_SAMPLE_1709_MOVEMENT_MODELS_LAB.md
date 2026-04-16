# BUILD_PR_LEVEL_17_39_SAMPLE_1709_MOVEMENT_MODELS_LAB

## Purpose
Implement Sample 1709 as a movement-models lab using existing engine systems only.

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_17_39_SAMPLE_1709_MOVEMENT_MODELS_LAB.md`
- existing Level 17 sample structure (`samples/phase-17/1701` to `1708`)

## Exact Build Target
1. Add sample `samples/phase-17/1709/` with:
   - `index.html`
   - `main.js`
   - one scene file for movement models lab
2. Demonstrate in-scene movement models:
   - direct axis movement
   - rotation/tank controls
   - weighted movement (if supportable within sample scope)
3. Include:
   - camera follow behavior
   - visible active-mode labeling and concise control hints
   - deterministic mode switching controls
4. Register `1709` in `samples/index.html`.
5. Add targeted runtime validation for:
   - launcher link presence
   - distinct behavior across movement modes
   - camera follow updates and mode label visibility

## Non-Goals
- no engine-core changes
- no new shared debug framework features
- no refactors to existing Level 17 samples
- no roadmap status updates

## Packaging Rule
Package only this PR's created/modified files into:
`tmp/BUILD_PR_LEVEL_17_39_SAMPLE_1709_MOVEMENT_MODELS_LAB.zip`
