# PLAN_PR_11_262_WORKSPACE_V2_MERGE_STATE_SINGLE_SOURCE_OF_TRUTH_ENFORCEMENT

## Purpose
Enforce one authoritative data source for Workspace V2 last-merge and undo availability state.

## Scope
- toolbox/workspace-v2/index.js
- tests/runtime/V2MergeStateSingleSourceOfTruth.test.mjs
- PR docs/report only

## Goals
- Remove cached/duplicated last-merge flag dependence
- Derive undo state from authoritative merge record validated against live data
- Recompute on load/refresh from data
- Auto-clear stale authoritative record when merged entry is missing/invalid

## Out of Scope
- No merge algorithm changes
- No UI redesign
- No unrelated files

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2MergeStateSingleSourceOfTruth.test.mjs
- node tests/runtime/V2MergeStateSingleSourceOfTruth.test.mjs
