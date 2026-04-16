# BUILD_PR_LEVEL_18_2_INPUT_SYSTEM_CONSOLIDATION

## PLAN

### Purpose
Consolidate input handling for overlay cycling and test inputs to ensure a single authoritative key mapping across runtime and tests.

### Goals
- Eliminate duplicate key mappings
- Ensure tests and runtime use same input source
- Prevent future drift (like Tab issue)

---

## BUILD

### Scope
- Centralize overlay cycle key definition
- Update runtime references to use shared source
- Update tests to reference shared input mapping
- No behavior change

### Test Steps
1. Verify cycle key works in runtime
2. Verify tests use shared mapping
3. Confirm no hardcoded keys remain

### Expected
- Single source of truth for cycle key
- No drift between runtime and tests
