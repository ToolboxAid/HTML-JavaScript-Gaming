MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_17_10_SAMPLE_1605_CHASE_CAMERA_AND_VEHICLE_FACING.

Goal:
Make Sample 1605 read clearly as a driving sandbox by ensuring the driven object turns with heading and the camera follows from behind.

Constraints:
- one PR purpose only
- smallest scoped valid change
- no repo-wide scanning
- no zip output from Codex
- keep 2D and networking untouched
- do not modify start_of_day
- preserve the prior 1605 steering fix

Implement:
1. Inspect samples/phase-16/1605/DrivingSandbox3DScene.js.
2. Ensure the rendered vehicle/box orientation matches heading.
3. Convert or tune the current camera into a chase camera that stays behind the driven object by default.
4. Keep framing simple, stable, and readable.
5. Preserve forward/reverse and current steering behavior.
6. Extend the smallest targeted behavioral sanity check only if useful.

Validate:
- verify vehicle visibly turns with heading
- verify camera stays behind the vehicle during normal driving
- verify vehicle remains visible during turning
- verify forward/reverse still function
- verify steering still behaves correctly
- verify sample still renders on load
- run targeted smoke for 1605
- update:
  - docs/dev/reports/change_summary.txt
  - docs/dev/reports/validation_checklist.txt

Output:
- modify repo files directly
- do not create any zip
- keep commit-ready changes minimal
