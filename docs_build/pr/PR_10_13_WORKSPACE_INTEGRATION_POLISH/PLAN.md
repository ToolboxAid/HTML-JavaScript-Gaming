# PLAN_PR_10_13_WORKSPACE_INTEGRATION_POLISH

## Purpose
Finalize workspace as the controlling container for all tools with consistent lifecycle and persistence.

## Scope
- Ensure workspace owns tool lifecycle
- Prevent tool-level resets on tab switch
- Ensure tool state persists while open
- Normalize open/close behavior
- No feature additions

## Acceptance
- Switching tools does not reset state
- Tools reopen in last state
- Workspace controls lifecycle (not tools)
