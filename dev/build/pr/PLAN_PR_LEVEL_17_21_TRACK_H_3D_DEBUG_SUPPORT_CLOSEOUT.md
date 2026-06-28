# PLAN_PR_LEVEL_17_21_TRACK_H_3D_DEBUG_SUPPORT_CLOSEOUT

## Purpose
Close out Track H 3D debug support by finishing the remaining Transform Inspector work and updating roadmap status in the same testable PR bundle.

## Why This PR Exists
Recent execution has already completed:
- camera debug panel
- render pipeline stages
- collision overlays
- scene graph inspector

The roadmap still shows Transform Inspector as in progress, with Track H and 3D debug support not yet fully closed. This PR reduces timeline and churn by bundling:
1. the remaining Transform Inspector completion work
2. Track H roadmap/status closeout
into one executable PR.

## Scope
- complete Transform Inspector to a validated done state
- add only the minimal provider/panel/wiring/test adjustments still required
- update roadmap status only after implementation and validation are complete
- package the final repo-structured ZIP under tmp/

## In Scope
- targeted Transform Inspector completion
- targeted tests
- validation checklist
- roadmap status-only updates tied to this implemented capability

## Out of Scope
- new 3D debug features beyond Transform Inspector completion
- render-engine rewrites
- physics changes
- broad cleanup
- unrelated docs cleanup
- start_of_day changes

## Acceptance Intent
- Transform Inspector is fully implemented and validated
- Track H items are closed if evidence supports closure
- 3D debug support status is updated conservatively and execution-backed
- no regressions to camera, render pipeline stages, collision overlays, or scene graph inspector
