MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_17_7_3D_VISIBILITY_CALIBRATION_AND_SANITY.

Goal:
Fix the current Phase 16 visibility defect where sample 1602 and sample 1604 load and accept input but do not show usable 3D output.

Constraints:
- one PR purpose only
- smallest scoped valid change
- no repo-wide scanning
- no zip output from Codex
- do not modify start_of_day
- keep 2D and networking untouched
- preserve samples/index.html unless a real correction is required

Implement:
1. Inspect samples/phase-16/shared/threeDWireframe.js for camera-space forward, yaw/pitch sign, near-plane, and projection assumptions.
2. Calibrate sample camera placement/framing in:
   - samples/phase-16/1602/MazeRunner3DScene.js
   - samples/phase-16/1604/Platformer3DBasicsScene.js
3. Apply the smallest shared-path correction needed so 1601, 1602, and 1604 all render visible wireframe geometry.
4. Add a minimal visibility sanity check for the affected Phase 16 samples if a lightweight existing test location already fits. Keep it surgical.

Validation:
- verify 1601 visible on load
- verify 1602 visible on load
- verify 1604 visible on load
- verify movement/input still works for 1602 and 1604
- run targeted smoke only
- write/update docs/dev/reports/validation_checklist.txt
- write/update docs/dev/reports/change_summary.txt

Output:
- modify repo files directly
- do not create any zip
- keep commit-ready changes minimal
