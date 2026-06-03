# BUILD_PR_11_264_WORKSPACE_V2_SESSION_STATE_MODEL_CONSOLIDATION

## Purpose
Implement a computed single-source session UI state model for Workspace V2 to reduce churn and stale decision paths.

## Files
- tools/workspace-v2/index.js
- tests/runtime/V2SessionStateModelConsolidation.test.mjs
- docs_build/dev/reports/PR_11_264_session_state_model_consolidation_report.md

## Implementation
1. Add unified state model computation method.
2. Add unified UI render method that applies the model.
3. Add one refresh entrypoint used by session UI handlers.
4. Route library/diff/merge/undo handler update methods to refresh entrypoint.
5. Keep authoritative merge-record validation as the undo truth source.
6. Preserve PR_11_263 UX behavior while removing duplicated condition trees.

## Acceptance
- UI state is derived from the computed model only.
- Undo availability derives from authoritative merge record only.
- No stale merge preview/status paths from scattered checks.
- No regressions in PR_11_263 stabilized messages and enablement semantics.

## Validation
- node --check tools/workspace-v2/index.js
- node --check tests/runtime/V2SessionStateModelConsolidation.test.mjs
- node tests/runtime/V2SessionStateModelConsolidation.test.mjs
