# PLAN_PR_LEVEL_17_18_RENDER_PIPELINE_STAGES

## Purpose
Add the next smallest 3D debug-support capability after the camera debug panel by exposing render pipeline stage visibility in the standard 3D debug surface.

## Why This PR Exists
Track H in the master roadmap still lists Render pipeline stages as planned work in the 3D debug-support lane. This PR isolates that single capability so it can be implemented, tested, and validated without expanding into collision overlays or scene graph inspection.

## Scope
Implement a minimal, testable render-pipeline stages panel for 3D debug support.

## In Scope
- one new 3D render-pipeline provider for read-only stage data
- one new standard 3D panel for render-pipeline stages
- minimal panel registration/wiring needed for the panel to appear in the existing debug surface
- test coverage for provider output and panel registration/render contract
- validation checklist updates for manual smoke verification

## Out of Scope
- collision overlays
- scene graph inspector
- camera debug panel changes except integration compatibility
- transform inspector expansion
- render-engine behavior changes beyond read-only debug exposure
- broad refactors or folder cleanup

## Constraints
- stay inside PLAN_PR -> BUILD_PR -> APPLY_PR workflow
- one PR purpose only
- smallest scoped valid change
- no repo-wide scanning unless required
- no start_of_day edits
- no unrelated workspace cleanup

## Target Shape
- `src/engine/debug/standard/threeD/providers/renderPipelineStagesProvider.js`
- `src/engine/debug/standard/threeD/panels/panel3dRenderPipelineStages.js`
- minimal registry/wiring file updates only if required by the existing 3D debug panel system
- targeted test file(s)

## Acceptance Intent
- panel appears in the existing 3D debug surface
- panel shows a stable ordered list of pipeline stages or stage-state rows
- panel remains read-only
- no regression to the already-added camera debug panel
- no regression to existing 3D support panels

## Validation Focus
- provider returns normalized stage rows
- panel renders empty/fallback state safely
- panel renders stage rows when provider returns data
- 3D debug surface still loads without console errors
