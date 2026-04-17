# BUILD_PR_LEVEL_18_7_UNSTABLE_SURFACE_REMOVAL_OR_ISOLATION

## Purpose
Advance Level 18 Track C by removing or isolating unstable/experimental surfaces while preserving stable contracts.

## Scope Executed
- inspected selector/provider public surfaces in `src/engine/debug/standard/threeD`
- identified unstable top-level barrel exposure for legacy summary-era 3D debug surfaces
- isolated legacy surfaces behind an explicit controlled boundary
- validated that active consumers remain on stable contracts

## Unstable Surface Identified
Top-level exports in `src/engine/debug/standard/threeD/index.js` exposed legacy summary-era APIs alongside current inspector-era APIs:
- legacy providers: transform/render-stage/collision/scene-graph summary
- legacy panels: transform/render-stages/collision/scene-graph summary

This mixed stable and legacy contracts in the primary barrel surface.

## Isolation Actions Applied
1. Added explicit legacy namespace module:
- `src/engine/debug/standard/threeD/legacySummarySurface.js`

2. Removed legacy summary symbols from top-level `threeD/index.js` exports.

3. Added controlled legacy boundary in top-level barrel:
- `export * as legacySummary3d from "./legacySummarySurface.js";`

Result:
- stable top-level surface now exposes current contracts only
- legacy summary contracts remain available through explicit opt-in namespace

## Consumer Impact Check
- no active `src/` or `tests/` consumers depended on removed top-level legacy summary exports
- legacy symbols are now referenced only within legacy module and underlying implementation files

## Files Changed
- `src/engine/debug/standard/threeD/index.js`
- `src/engine/debug/standard/threeD/legacySummarySurface.js`

## Validation Commands Run
1. Legacy isolation contract check (inline Node):
- asserts legacy summary symbols are absent at top-level `threeD` exports
- asserts legacy summary symbols are present under `threeD.legacySummary3d`
- Result: PASS

2. Consumer dependency scan:
```bash
rg -n "PROVIDER_3D_TRANSFORM_SUMMARY|createTransformSummaryProvider|PROVIDER_3D_RENDER_STAGE_SUMMARY|createRenderStageSummaryProvider|PROVIDER_3D_COLLISION_SUMMARY|createCollisionSummaryProvider|PROVIDER_3D_SCENE_GRAPH_SUMMARY|createSceneGraphSummaryProvider|PANEL_3D_TRANSFORM\b|create3dTransformPanel|PANEL_3D_RENDER_STAGES|create3dRenderStagesPanel|PANEL_3D_COLLISION\b|create3dCollisionPanel|PANEL_3D_SCENE_GRAPH\b|create3dSceneGraphPanel" src tests -g "*.js" -g "*.mjs"
```
- Result: matches limited to legacy boundary/module definitions only

3. Focused regression tests:
- `tests/tools/CameraDebugPanel.test.mjs`
- `tests/tools/TransformInspectorDebugPanel.test.mjs`
- `tests/tools/RenderPipelineStagesDebugPanel.test.mjs`
- `tests/tools/CollisionOverlaysDebugPanel.test.mjs`
- `tests/tools/SceneGraphInspectorDebugPanel.test.mjs`
- `tests/final/DebugObservabilityMaturity.test.mjs`
- Result: 6/6 PASS

## Roadmap Note
- No roadmap file update was included in this PR slice to avoid mixing with pre-existing unrelated working-tree changes in the roadmap file.
