# BUILD_PR_LEVEL_18_5_OVERLAY_CONFIGURATION_EXTERNALIZATION

## PLAN

### Purpose
Externalize overlay stack definitions and configuration to remove hardcoded mappings and improve maintainability.

### Goals
- Move overlay stack definitions to config
- Allow per-sample configuration
- Reduce hardcoded logic

---

## BUILD

### Scope
- Define external config structure for overlay stacks
- Refactor runtime to read from config
- Preserve existing behavior exactly
- No UI or feature changes

### Test Steps
1. Load samples
2. Verify overlays match previous stacks
3. Modify config and confirm behavior updates

### Expected
- Same behavior as before
- Config-driven overlay stacks
