# BUILD_PR_LEVEL_17_29_SAMPLE_1610_HYBRID_FIX

Implement:

1. Mini Map Fix
- invert Y-axis mapping so world forward aligns with upward direction on mini map
- ensure consistent coordinate transform between world and mini map

2. Hybrid Clarity
Add explicit differentiation:
- 2D layer:
  - top-down mini map or UI overlay
  - clearly labeled "2D Layer"
- 3D layer:
  - main camera world
  - clearly labeled "3D World"

3. Visual Indicators
- add label overlays or color coding
- optional toggle to highlight layers

Constraints:
- minimal changes
- no engine refactor
- sample must remain simple and educational

Validation:
- moving forward = moves up on mini map
- user can clearly identify what is 2D vs 3D
