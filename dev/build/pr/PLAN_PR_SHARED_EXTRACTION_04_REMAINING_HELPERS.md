# PLAN_PR_SHARED_EXTRACTION_04_REMAINING_HELPERS

## Purpose
Plan extraction + normalization for remaining helpers not yet centralized:
- asFiniteNumber
- getState (non-shared + widespread usage)

## Scope
- Identify explicit targets for remaining helpers
- Define exact source → destination mapping
- Define exact import update targets

## Constraints
- No repo-wide guessing
- No execution in this PR
- One purpose only

## Required Outputs (next BUILD readiness)
Must produce:
1. Exact source file list
2. Exact destination files
3. Exact helper mappings
4. Exact import update targets

## Strategy

### Phase 1: asFiniteNumber
- Consolidate to:
  src/shared/utils/numberUtils.js
- Identify all consumers explicitly

### Phase 2: getState
- Split into:
  src/shared/state/getState.js (shared-safe version)
- DO NOT touch engine-specific state accessors

## Acceptance Criteria
- All targets explicitly listed
- No ambiguity remains for BUILD
- No guessing required

## Non-Goals
- No code changes
- No file movement
- No import updates

## Next
BUILD_PR_SHARED_EXTRACTION_04_REMAINING_HELPERS
