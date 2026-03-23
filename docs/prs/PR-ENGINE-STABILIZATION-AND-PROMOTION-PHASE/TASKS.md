# TASKS - Engine Stabilization And Promotion Phase

## Audit Completion
- [x] Audit `engine/` for post-cleanup stabilization seams
- [x] Audit later samples, especially `sample90+`, for repeated logic and thin-engine-consumer patterns
- [x] Audit `games/Asteroids/` for stabilization pressure points and validation surfaces
- [x] Confirm most late-sample reusable logic is already engine-owned
- [x] Identify the highest-value remaining stabilization targets
- [x] Classify promotion candidates as `PROMOTE_TO_ENGINE`, `KEEP_LOCAL`, `SPLIT_REQUIRED`, or `NEEDS_MORE_PROOF`
- [x] Map Asteroids validation targets and current proof gaps
- [x] Write a small-PR execution ladder instead of a broad refactor plan
- [x] Keep this PR docs-only with no runtime source edits

## Follow-Up Execution Ladder
- [ ] BUILD_PR 1: Align `Engine.setScene()` lifecycle behavior with `SceneManager` and remove raw `TransitionScene` renderer-context leakage
- [ ] BUILD_PR 1: Add focused engine/scene tests for lifecycle exit and transition rendering behavior
- [ ] BUILD_PR 2: Harden `StorageService` / `SettingsSystem` browser defaults and add deterministic seams to `ParticleSystem`
- [ ] BUILD_PR 2: Add storage-absence and engine-FX determinism tests
- [ ] BUILD_PR 3: Expand Asteroids validation for browser boot, scene lifecycle, fullscreen affordance, and snapshot/player-swap behavior
- [ ] BUILD_PR 4: Promote Asteroids vector transform usage onto `engine/vector` and split only the narrow reusable scalar/state guard helpers
- [ ] BUILD_PR 5: Consolidate late-sample bootstrap repetition under sample infrastructure and resolve the empty `sample183-asteroids-game` endpoint
