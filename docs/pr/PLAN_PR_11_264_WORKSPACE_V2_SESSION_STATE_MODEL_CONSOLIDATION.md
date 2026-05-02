# PLAN_PR_11_264_WORKSPACE_V2_SESSION_STATE_MODEL_CONSOLIDATION

## Purpose
Consolidate Workspace V2 session/merge UI decision logic into one computed internal state model.

## Scope
- tools/workspace-v2/index.js
- tests/runtime/V2SessionStateModelConsolidation.test.mjs
- PR docs/report only

## Goals
- Single computed model drives:
  - button enable/disable
  - status/enable text
  - undo availability
  - preview visibility
- Remove scattered duplicated condition logic across handlers.
- Recompute model on selection, merge apply, undo, delete, and refresh/load paths.

## Out of Scope
- No schema changes
- No other tools
- No UI redesign

## Validation
- node --check tools/workspace-v2/index.js
- node --check tests/runtime/V2SessionStateModelConsolidation.test.mjs
- node tests/runtime/V2SessionStateModelConsolidation.test.mjs
