# PLAN_PR_LEVEL_10_5_NO_HIDDEN_TOOL_COUPLING_VALIDATION

## Purpose
Enforce the final Phase 10 architecture rule:

- no silent fallback data
- no hardcoded asset paths
- tools require explicit manifest/input data
- tools without input show safe empty state

## Scope
- Scan all tools for hidden sample/default data loading.
- Scan all tools for hardcoded asset paths.
- Remove or fail such behavior.
- Add tests to prevent regression.
- No start_of_day changes.
