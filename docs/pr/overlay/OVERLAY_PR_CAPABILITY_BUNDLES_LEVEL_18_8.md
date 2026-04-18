# Overlay PR Capability Bundles (Level 18.8)

Purpose: consolidate overlay-slice PR history into capability-level bundles so related PR slices are tracked as complete units.

Scope:
- overlay slice PR docs and overlay reports only
- no implementation/runtime changes

## Consolidation Rules
- Each bundle represents one complete overlay capability area.
- Bundle membership is additive and traceable to existing PR docs/reports.
- Build and report artifacts remain at original paths; this doc provides consolidated navigation.

## Bundle A: 3D Debug Panel Surface
Capability:
- establishes the Phase 17 3D debug panel set and closeout gate for standard threeD support

Included PR docs:
- `docs/pr/PLAN_PR_LEVEL_17_17_CAMERA_DEBUG_PANEL.md`
- `docs/pr/BUILD_PR_LEVEL_17_17_CAMERA_DEBUG_PANEL.md`
- `docs/pr/PLAN_PR_LEVEL_17_18_RENDER_PIPELINE_STAGES.md`
- `docs/pr/BUILD_PR_LEVEL_17_18_RENDER_PIPELINE_STAGES.md`
- `docs/pr/PLAN_PR_LEVEL_17_19_COLLISION_OVERLAYS.md`
- `docs/pr/BUILD_PR_LEVEL_17_19_COLLISION_OVERLAYS.md`
- `docs/pr/PLAN_PR_LEVEL_17_20_SCENE_GRAPH_INSPECTOR.md`
- `docs/pr/BUILD_PR_LEVEL_17_20_SCENE_GRAPH_INSPECTOR.md`
- `docs/pr/PLAN_PR_LEVEL_17_21_TRACK_H_3D_DEBUG_SUPPORT_CLOSEOUT.md`
- `docs/pr/BUILD_PR_LEVEL_17_21_TRACK_H_3D_DEBUG_SUPPORT_CLOSEOUT.md`

## Bundle B: Overlay Input And Stack Mapping
Capability:
- standardizes overlay placement and cycle mapping behavior across targeted gameplay samples

Included PR docs:
- `docs/pr/PLAN_PR_LEVEL_17_51_DEBUG_OVERLAY_POSITION_BOTTOM_RIGHT.md`
- `docs/pr/BUILD_PR_LEVEL_17_51_DEBUG_OVERLAY_POSITION_BOTTOM_RIGHT.md`
- `docs/pr/BUILD_PR_LEVEL_17_52_DEBUG_OVERLAY_CYCLE_KEY_AND_SAMPLE_STACK_MAP.md`

Validation/report artifacts:
- `docs/reports/overlay/level-17/BUILD_PR_LEVEL_17_59_DEBUG_OVERLAY_PROMOTE_BASELINE_report.md`
- `docs/reports/overlay/level-17/BUILD_PR_LEVEL_17_61_OVERLAY_SYSTEM_VALIDATION_SWEEP.md`
- `docs/reports/overlay/level-17/LEVEL17_OVERLAY_VALIDATION_SWEEP_2026-04-16.txt`

## Bundle C: Overlay Runtime Hardening (Level 18)
Capability:
- hardens boundaries, contracts, consistency, CSS/UI normalization, docs structure, and repo hygiene for overlay slices

Included PR docs:
- `docs/pr/BUILD_PR_LEVEL_18_1_ENGINE_USAGE_ENFORCEMENT_AUDIT_SLICE.md`
- `docs/pr/BUILD_PR_LEVEL_18_2_BOUNDARY_HARDENING_OVERLAY_SLICE.md`
- `docs/pr/BUILD_PR_LEVEL_18_3_CONTRACT_STABILIZATION_OVERLAY_SLICE.md`
- `docs/pr/BUILD_PR_LEVEL_18_4_CODEBASE_CONSISTENCY_OVERLAY_SLICE.md`
- `docs/pr/BUILD_PR_LEVEL_18_5_CSS_UI_NORMALIZATION_OVERLAY_SLICE.md`
- `docs/pr/BUILD_PR_LEVEL_18_6_DOCS_SYSTEM_CLEANUP_OVERLAY_SLICE.md`
- `docs/pr/BUILD_PR_LEVEL_18_7_REPO_HYGIENE_OVERLAY_SLICE.md`
- `docs/pr/BUILD_PR_LEVEL_18_8_PR_CONSOLIDATION_OVERLAY_SLICE.md`

Supporting structure docs:
- `docs/pr/overlay/OVERLAY_DOCS_BUCKETS.md`
- `docs/reference/features/docs-system/move-history-preserved.md`
- `docs/reports/overlay/README.md`

## Bundle D: Gameplay Overlay Runtime Expansion (Level 19)
Capability:
- extends overlay runtime with expansion framework, gameplay-safe controls, input priority rules, and multi-layer composition

Included report artifacts:
- `docs/reports/overlay/level-19/BUILD_PR_LEVEL_19_1_OVERLAY_SYSTEM_EXPANSION_FRAMEWORK_report.md`
- `docs/reports/overlay/level-19/BUILD_PR_LEVEL_19_2_OVERLAY_GAMEPLAY_RUNTIME_INTEGRATION_report.md`
- `docs/reports/overlay/level-19/BUILD_PR_LEVEL_19_3_OVERLAY_INTERACTION_CONTROLS_report.md`
- `docs/reports/overlay/level-19/BUILD_PR_LEVEL_19_4_OVERLAY_FOCUS_AND_INPUT_PRIORITY_report.md`
- `docs/reports/overlay/level-19/BUILD_PR_LEVEL_19_5_OVERLAY_INPUT_EDGE_CASES_report.md`
- `docs/reports/overlay/level-19/BUILD_PR_LEVEL_19_6_OVERLAY_MULTI_LAYER_COMPOSITION_report.md`

## Consolidation Outcome
- Overlay PR history is now grouped into 4 capability-level bundles.
- No functional behavior was changed by this consolidation.
