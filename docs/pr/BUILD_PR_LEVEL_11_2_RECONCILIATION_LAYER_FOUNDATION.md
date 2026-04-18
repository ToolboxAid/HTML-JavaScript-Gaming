Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_LEVEL_11_2_RECONCILIATION_LAYER_FOUNDATION.md

# BUILD_PR_LEVEL_11_2_RECONCILIATION_LAYER_FOUNDATION

## Build Summary
Prepared a docs-first Level 11.2 follow-up that defines the reconciliation-layer implementation shape without introducing runtime code changes. This bundle keeps Sample C as the proving ground/consumer while standardizing reusable naming, bounded timeline expectations, and debug-surface attachment boundaries for future APPLY work.

## Workflow Convention
PLAN_PR -> BUILD_PR -> APPLY_PR

## Source Guidance Used
- `docs/operations/dev/RECONCILIATION_LAYER_SPEC.md`
- `docs/operations/dev/STATE_TIMELINE_SPEC.md`
- `docs/operations/dev/DEBUG_SURFACE_CONTRACT.md`

## Scope Safety
- docs/planning only
- no engine core API modifications
- no server-dashboard implementation
- no docker/container implementation
- no transport/runtime network implementation

## Implementation Direction (Docs-First)
### 1) Reconciliation Layer Foundation (Sample-Level Shared Layer)
- define a reusable sample-level layer boundary for predicted vs authoritative comparison
- keep ownership in Level 11 sample space, not engine-core
- keep interface names future-proof and neutral (avoid sample-specific prefixes in shared layer names)
- keep Sample C as a consumer adapter and proving path, not the shared implementation source

### 2) Bounded Timeline / History Model
- require bounded frame/tick history buffers
- require deterministic prune behavior for oldest snapshots
- support exact alignment first and nearest-prior fallback with explicit annotation
- expose timeline status for debug (frame gap, exact/approximate alignment, unresolved divergence count)

### 3) Debug Surface Contract Normalization
- standardize attach/detach and read-only diagnostics flow
- keep debug surfaces optional and detachable from normal runtime
- expose normalized divergence report and correction plan without runtime ownership leakage
- keep rendering/overlay behavior separate from reconciliation decisions

### 4) Public Selector/Event Boundary Rules
- proposed interfaces must consume approved public selector outputs only:
  - `selectWorldState`
  - `selectGameState`
  - `selectCurrentMode`
  - `selectCurrentPhase`
  - `selectWaveProgress`
  - `selectIsRunComplete`
  - `selectScoreSnapshot`
  - `selectObjectiveSnapshot`
  - `selectWorldFlag`
- proposed interfaces must integrate via approved public event envelopes/types only:
  - `worldState.transition.applied`
  - `worldState.transition.rejected`
  - `gameState.phase.changed`
  - `gameState.mode.changed`
  - `objective.snapshot.updated`
- do not introduce private scene/engine mutation hooks to move reconciliation data

### 5) Naming and Layering Guidance for Future APPLY
- prefer neutral shared names such as:
  - `ReconciliationLayerAdapter`
  - `StateTimelineBuffer`
  - `DivergenceReportNormalizer`
  - `CorrectionPlanPolicy`
  - `DebugSurfaceReconciliationBridge`
- avoid sample-specific ad hoc names in any shared Level 11.2 helper surfaces
- keep Sample C integration in a thin adapter path that consumes these shared contracts

## Acceptance Criteria for Follow-On APPLY
- docs-first boundaries remain intact during first implementation slice
- reconciliation interfaces stay selector/event boundary-safe
- timeline buffer is bounded and annotation-capable
- debug surface remains optional/read-mostly and detached from core ownership
- Sample C proves the contract as a consumer without becoming the shared runtime layer

## Out of Scope Confirmation
- engine-core API work
- server dashboard track work
- docker/containerization track work
- transport implementation
