# BUILD_PR_LEVEL_01_FINAL_RESIDUE_ONLY

## Purpose
Finish the last remaining open items in roadmap section 1 with one final residue-only PR.

## Applied Delta
- Added `src/engine/rendering/` as the target rendering surface with compatibility-first re-export modules.
- Added `src/engine/scene/` as the target scene surface with compatibility-first re-export modules.
- Added `src/engine/physics/index.js` as the target physics surface (re-exporting active collision primitives).
- Added focused validation test:
  - `tests/core/Section1FinalResidueStructure.test.mjs`
- Updated roadmap status markers only for the required residue items.

## Files Added
- `src/engine/rendering/index.js`
- `src/engine/rendering/CanvasRenderer.js`
- `src/engine/rendering/ResolutionScaler.js`
- `src/engine/rendering/LayeredRenderSystem.js`
- `src/engine/rendering/SpriteRenderSystem.js`
- `src/engine/rendering/Renderer.js`
- `src/engine/scene/index.js`
- `src/engine/scene/Scene.js`
- `src/engine/scene/SceneManager.js`
- `src/engine/scene/SceneTransition.js`
- `src/engine/scene/TransitionScene.js`
- `src/engine/scene/SceneTransitionController.js`
- `src/engine/scene/AttractModeController.js`
- `src/engine/physics/index.js`
- `tests/core/Section1FinalResidueStructure.test.mjs`

## Roadmap Status Updates (Only)
- `[.] implementation PRs executed` -> `[x]`
- `[ ] src/engine/rendering` -> `[x]`
- `[ ] src/engine/physics` -> `[x]`
- `[ ] src/engine/scene` -> `[x]`

## Validation
- `node --check` on all newly added engine surface modules and the focused residue test file.
- `node tests/core/Section1FinalResidueStructure.test.mjs` to verify:
  - new rendering surface exports resolve
  - new scene surface exports resolve
  - new physics surface export resolves and behaves correctly
- Focused existing compatibility checks:
  - `node tests/render/Renderer.test.mjs`
  - `node tests/scenes/SceneManager.test.mjs`

## Residue Closeout Result
- All four required residue items are now truthfully closable.
- Existing `src/engine/render` and `src/engine/scenes` imports remain valid.

## Scope Guard
- Residue-only closeout.
- No section-2 or unrelated structure work.
- No broad folder churn.

## Packaging
`<project folder>/tmp/BUILD_PR_LEVEL_01_FINAL_RESIDUE_ONLY.zip`

## Status
- Section-1 target residue completed for the four requested items.
