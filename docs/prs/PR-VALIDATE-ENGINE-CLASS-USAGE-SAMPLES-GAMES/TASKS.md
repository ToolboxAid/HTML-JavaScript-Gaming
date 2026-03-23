Toolbox Aid
David Quesenberry
03/23/2026
TASKS.md

# TASKS - Validate Engine Class Usage Across Samples and Games

- [x] Identify the current canonical engine classes/modules that shipped samples and games should use
- [x] Confirm the public-surface rule: prefer `engine/<subsystem>/index.js` when it exists, with `engine/core/Engine.js` as the canonical direct boot import
- [x] Audit `samples/_shared/` for current sample-owned bootstrap usage
- [x] Inspect every sample folder under `samples/`
- [x] Inspect the shipped game folder under `games/Asteroids/`
- [x] Record exact deep-import boundary violations with file evidence
- [x] Classify each audited item as `CURRENT`, `STALE_USAGE`, `MIXED_USAGE`, or `REVIEW_REQUIRED`
- [x] Document the repo-wide dominant drift: deep `engine/scenes/Scene.js` imports alongside current barrel usage
- [x] Document Asteroids-specific deep imports that already have public barrel replacements
- [x] Confirm whether any shipped item still depends on provably stale engine class names
- [x] Confirm whether any shipped item requires `REVIEW_REQUIRED` because the canonical replacement is ambiguous
- [x] Propose the smallest safe BUILD_PR ladder for alignment
- [x] Keep this PR docs-only with no runtime source changes

## Audit Result Summary
- `CURRENT`: `samples/_shared`
- `MIXED_USAGE`: every shipped sample folder from `sample01-basic-loop` through `sample182-scene-graph-entity-hierarchy-viewer`, plus `games/Asteroids`
- `STALE_USAGE`: none proven after full-scope scan
- `REVIEW_REQUIRED`: none proven after full-scope scan

## Small BUILD_PR Ladder

### BUILD_PR 1
`PR-ENGINE-CLASS-USAGE-ALIGNMENT-SCENES`

Goal:
- normalize `Scene` imports to `engine/scenes/index.js` across samples and Asteroids

Risk:
- low

### BUILD_PR 2
`PR-ASTEROIDS-ENGINE-BARREL-ALIGNMENT`

Goal:
- normalize Asteroids deep imports for `fx`, `collision`, `utils`, and `tooling` to public engine barrels

Risk:
- low

### BUILD_PR 3
`PR-SAMPLES-GAMES-ENGINE-IMPORT-GUARDRAIL`

Goal:
- add focused validation to catch new deep imports into engine subsystems that already publish `index.js`

Risk:
- low to medium

## Explicit Non-Goals For This Audit PR
- no runtime import rewrites
- no engine API redesign
- no gameplay changes
- no sample behavior changes
- no game behavior changes
