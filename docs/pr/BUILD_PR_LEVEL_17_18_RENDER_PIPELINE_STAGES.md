# BUILD_PR_LEVEL_17_18_RENDER_PIPELINE_STAGES

## Purpose
Implement the next scoped Track H 3D debug-support item: render pipeline stages.

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_17_18_RENDER_PIPELINE_STAGES.md`

## Exact Build Target
Add a read-only render-pipeline stages panel to the standard 3D debug surface using the smallest viable provider + panel pairing.

## Required Outputs
- `src/engine/debug/standard/threeD/providers/renderPipelineStagesProvider.js`
- `src/engine/debug/standard/threeD/panels/panel3dRenderPipelineStages.js`
- minimal updates to existing 3D panel registration/wiring only where required
- targeted automated test coverage
- no unrelated file edits

## Functional Requirements
1. Provider returns a normalized array of stage rows.
2. Each row must use stable keys and safe fallback values.
3. Panel renders the provider output in deterministic display order.
4. Panel safely handles no-data and partial-data states.
5. Panel is read-only and does not mutate render state.
6. Existing 3D debug support remains functional after wiring.

## Allowed Data Surface
Use only already-available render/debug state that is reachable through existing public or local debug contracts. Do not introduce new engine-core behavior purely to make this panel richer.

## Non-Goals
- no collision overlays
- no scene graph inspector
- no transform inspector expansion
- no engine rendering architecture rewrite
- no broad UI cleanup
- no roadmap edits in this PR

## Implementation Notes
- prefer the same naming/layout conventions already used by the camera debug panel
- keep provider sanitization explicit and minimal
- if a registration list exists, add one entry only for this panel
- preserve current panel ordering unless a single adjacent insertion is required

## Automated Validation
Add or update targeted test(s) to verify:
- provider normalization
- panel render contract
- safe fallback state
- registration visibility if registration is file-driven

## Manual Validation
Follow `docs/reports/validation_checklist.txt`.

## Packaging Rule
Package only files relevant to this PR into the final repo-structured ZIP.
