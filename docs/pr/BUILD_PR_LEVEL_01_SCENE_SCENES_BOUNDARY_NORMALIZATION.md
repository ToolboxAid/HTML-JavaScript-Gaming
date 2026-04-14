# BUILD_PR_LEVEL_01_SCENE_SCENES_BOUNDARY_NORMALIZATION

## Purpose
Normalize engine scene runtime to one boundary: `src/engine/scene`.

## Applied Delta

### 1) Single top-level engine scene boundary enforced
- Removed competing boundary directory:
  - `src/engine/scenes/` (deleted)
- Kept singular engine runtime boundary:
  - `src/engine/scene/`

### 2) Engine scene runtime ownership clarified
- Replaced prior `scene` proxy wrappers with real runtime implementation files in `src/engine/scene/`:
  - `Scene.js`
  - `SceneManager.js`
  - `SceneTransition.js`
  - `SceneTransitionController.js`
  - `TransitionScene.js`
  - `AttractModeController.js`
  - `index.js`
- Engine continues to own reusable scene runtime logic only.
- Game/sample scene content remains in game/sample-owned paths.

### 3) Import/export normalization to one truth
- Normalized all active runtime/test/sample imports from `src/engine/scenes/...` to `src/engine/scene/...` across:
  - `games/*/game/*Scene.js`
  - `samples/phase-*/**/*Scene*.js` and related sample mains
  - `tests/scenes/*.test.mjs`
  - `tests/core/EngineSceneLifecycle.test.mjs`
  - `tests/final/PlatformUxSystems.test.mjs`
- Updated documentation path references where touched:
  - `docs/architecture/engine-scene-transitions.md`
  - `docs/samples/sample-template.md`
- Updated sample metadata references:
  - `samples/metadata/samples.shared.boundaries.report.json`
  - `samples/metadata/samples.index.metadata.json`

## Roadmap Handling
- No roadmap status-marker change was required.
- No roadmap prose text was rewritten.

## Validation
- `node --check` across all changed JS/MJS files (`236` files checked, `0` parse failures).
- Focused scene validation tests:
  - `node tests/scenes/SceneManager.test.mjs`
  - `node tests/scenes/TransitionScene.test.mjs`
  - `node tests/scenes/AttractModeController.test.mjs`
  - `node tests/core/EngineSceneLifecycle.test.mjs`
  - `node tests/final/PlatformUxSystems.test.mjs`
- Boundary checks:
  - no remaining `src/engine/scenes` imports in `src`, `games`, `samples`, `tests`, `tools`, `docs/architecture`, `docs/samples`
  - `src/engine` contains `scene` and no `scenes`

## Packaging
`<project folder>/tmp/BUILD_PR_LEVEL_01_SCENE_SCENES_BOUNDARY_NORMALIZATION.zip`

## Scope guard
- surgical implementation only
- no unrelated repo changes
