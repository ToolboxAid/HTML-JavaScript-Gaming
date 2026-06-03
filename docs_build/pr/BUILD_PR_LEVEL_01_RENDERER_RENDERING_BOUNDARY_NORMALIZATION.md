# BUILD_PR_LEVEL_01_RENDERER_RENDERING_BOUNDARY_NORMALIZATION

## Purpose
Normalize engine rendering to one boundary: `src/engine/rendering`.

## Applied Delta

### 1) Single top-level rendering boundary enforced
- Removed competing path `src/engine/render/` completely.
- Kept `src/engine/rendering/` as the only render-domain boundary.

### 2) Renderer remains implementation inside rendering
- `CanvasRenderer`, `Renderer`, `ResolutionScaler`, `SpriteRenderSystem`, and `LayeredRenderSystem` now live directly in `src/engine/rendering/` as real implementations (not re-export wrappers).
- `src/engine/core/Engine.js` now imports `CanvasRenderer` from `../rendering/index.js`.

### 3) Import/export normalization
- Updated sample/test imports from `/src/engine/render/index.js` and `../../src/engine/render/...` to rendering equivalents.
- Updated render-domain contract labels in `tools/shared/renderPipelineContract.js` from `engine/render` to `engine/rendering`.
- Updated sample metadata references from `engine/render/index/*` and `/src/engine/render/index.js` to rendering equivalents.

### 4) Structure simplicity
- No new `rendering/vector`, `rendering/sprite`, or `rendering/layer` subfolders were introduced.
- Boundary remains flat with only one justified added module already in use: `src/engine/rendering/VectorDrawing.js`.

## Roadmap Handling
- No roadmap status change was required for this normalization slice.
- No roadmap text rewrite was performed.

## Validation
- `node --check` on touched rendering/core/sample/test files.
- `node tests/render/Renderer.test.mjs`
- `node tests/production/ProductionReadiness.test.mjs`
- `node --input-type=module -e "import { run } from './tests/final/PrecisionCollisionSystems.test.mjs'; run();"`
- Boundary checks:
  - no `src/engine/render/` imports remain in `src`, `games`, `samples`, `tools`, `tests`
  - no `../render/` re-export dependencies remain

## Packaging
`<project folder>/tmp/BUILD_PR_LEVEL_01_RENDERER_RENDERING_BOUNDARY_NORMALIZATION.zip`

## Scope guard
- surgical implementation only
- no unrelated repo changes
