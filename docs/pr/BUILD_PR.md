# BUILD_PR_LEVEL_17_57_DEBUG_OVERLAY_SAMPLE_1709_1711_MOVEMENT_ALIGNMENT

## Purpose
Align overlay stacks for samples 1709 and 1711 (movement-focused) with correct order, bottom-right placement, and non-Tab cycle behavior.

## Scope
- Samples: 1709, 1711
- Stack:
  - Movement Runtime
  - Movement Lab HUD
- Bottom-right anchor
- Non-Tab cycle key validation

## Test Steps
1. Load samples 1709 and 1711
2. Verify bottom-right placement
3. Cycle overlays and confirm order
4. Confirm Movement Runtime and HUD render correctly

## Expected
- Correct stack order
- Stable cycling behavior
- No Tab usage
