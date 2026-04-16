# BUILD_PR_LEVEL_19_4_OVERLAY_FOCUS_AND_INPUT_PRIORITY

## Purpose
Define and enforce focus + input priority rules so gameplay and overlays coexist without conflicts.

## Scope
- Establish input priority: gameplay > overlay (except explicit overlay controls)
- Define focus model (no hard focus steal by overlays)
- Ensure overlay controls are scoped and non-invasive

## Test Steps
1. Run gameplay sample
2. Trigger overlay controls
3. Verify gameplay input remains primary
4. Confirm overlay controls only act when invoked

## Expected
- No input conflicts
- Predictable priority behavior
