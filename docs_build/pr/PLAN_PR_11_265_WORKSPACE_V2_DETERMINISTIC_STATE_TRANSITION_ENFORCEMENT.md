# PLAN_PR_11_265_WORKSPACE_V2_DETERMINISTIC_STATE_TRANSITION_ENFORCEMENT

## Purpose
Enforce deterministic Workspace V2 merge-state transitions with explicit action-gated state changes.

## Scope
- toolbox/workspace-v2/index.js
- tests/runtime/V2DeterministicStateTransitions.test.mjs
- PR docs/report only

## Goals
- Define and enforce explicit transition states:
  - `idle`
  - `valid_selection`
  - `preview_ready`
  - `preview_active`
  - `merge_applied`
  - `undo_available`
- Ensure preview/confirm/apply/undo actions pass through controlled transition checks.
- Prevent illegal transitions from mutating UI/session merge state.
- Keep UI render decisions derived from the existing PR_11_264 state-model refresh path.

## Out of Scope
- No schema changes
- No cross-tool changes
- No Workspace Manager v1 changes

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2DeterministicStateTransitions.test.mjs
- node tests/runtime/V2DeterministicStateTransitions.test.mjs
- node tests/runtime/V2SessionStateModelConsolidation.test.mjs
