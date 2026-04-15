MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_17_11_SAMPLE_1605_HARD_LOCK_CHASE_AND_ASYMMETRIC_VEHICLE.

Goal:
Fix Sample 1605 so the vehicle visibly turns and the camera cannot get lost.

Context:
The prior 1605 chase-camera/facing update still fails real user validation:
- box does not appear to turn
- camera still gets lost
Automated checks are insufficient; prioritize visible readability.

Constraints:
- one PR purpose only
- smallest scoped valid change
- no repo-wide scanning
- no zip output from Codex
- keep 2D and networking untouched
- do not modify start_of_day

Implement:
1. Inspect samples/phase-16/1605/DrivingSandbox3DScene.js.
2. Replace the ambiguous symmetric rendered vehicle with a clearly directional asymmetric wireframe/shape.
3. Add a strong front marker that rotates with heading.
4. Hard-lock the chase camera behind the vehicle each frame using heading-based offset.
5. Aim the camera at the vehicle each frame.
6. Remove or minimize yaw lag/smoothing if it makes the vehicle easier to lose.
7. Preserve current steering and forward/reverse behavior.

Validate:
- verify visible heading change during left/right steering
- verify front marker rotates with heading
- verify camera stays behind the vehicle
- verify camera remains aimed at vehicle
- verify steering still behaves correctly
- verify forward/reverse still function
- verify sample still renders on load
- run targeted smoke for 1605
- update:
  - docs/dev/reports/change_summary.txt
  - docs/dev/reports/validation_checklist.txt

Output:
- modify repo files directly
- do not create any zip
- keep commit-ready changes minimal
