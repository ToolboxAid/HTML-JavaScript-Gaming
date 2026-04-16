# BUILD_PR_LEVEL_17_55_DEBUG_OVERLAY_SAMPLE_1708_1710_STACK_NORMALIZATION

## Purpose
Normalize overlay stacks for samples 1708 and 1710 with consistent bottom-right placement and correct cycling order.

## Scope
- Samples: 1708, 1710
- Stack:
  - UI Layer
  - Mission Feed
  - <...ADY>
  - Mini-Game Runtime
- Bottom-right anchor
- Non-Tab cycle key validation

## Test Steps
1. Load 1708 and 1710
2. Verify bottom-right placement
3. Cycle overlays → confirm order
4. Confirm Mini-Game Runtime visibility

## Expected
- Identical stack behavior across both samples
- Stable cycling
- No Tab usage
