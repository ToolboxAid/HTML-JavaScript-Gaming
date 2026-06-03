# PLAN_PR_11_261_WORKSPACE_V2_MERGE_STATE_STATUS_RESET_AND_FINAL_UX_POLISH

## Purpose
Reset stale merge-state UI in Workspace V2 so preview/apply text does not persist across state-invalidating actions.

## Scope
- toolbox/workspace-v2/index.js
- tests/runtime/V2MergeStateStatusReset.test.mjs
- docs only for this PR

## In Scope Behavior
- Clear stale merge preview/status after:
  - Undo Last Merge
  - source/target selection change
  - merged recent session deletion
  - invalid or missing selections
  - page refresh baseline render
- Keep Undo availability logic based on actual recent+session backing.

## Out of Scope
- No merge algorithm changes
- No schema/sample/game changes
- No broad refactors

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2MergeStateStatusReset.test.mjs
- node tests/runtime/V2MergeStateStatusReset.test.mjs
