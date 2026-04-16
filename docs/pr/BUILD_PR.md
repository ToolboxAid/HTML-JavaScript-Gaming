# BUILD_PR_LEVEL_17_58_DEBUG_OVERLAY_FULL_VALIDATION_SWEEP

## Purpose
Perform a full Level 17 validation sweep across all updated samples to confirm consistency of:
- Bottom-right overlay placement
- Non-Tab cycle key behavior
- Correct stack mappings per sample

## Scope
Samples:
- 1708, 1710
- 1709, 1711
- 1712
- 1713

Validation Only:
- No new features
- No runtime changes
- No test rewrites (already handled in 17_56)

## Test Steps
1. Load each sample
2. Verify bottom-right placement
3. Cycle overlays
4. Confirm correct stack per sample
5. Confirm no Tab interaction remains

## Expected
- All samples behave consistently
- No regression from prior PRs
