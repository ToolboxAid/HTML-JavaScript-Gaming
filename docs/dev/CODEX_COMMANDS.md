MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_17_9_SAMPLE_1605_DRIVING_CONTROL_FIX.

Goal:
Fix Sample 1605 - 3D Driving Sandbox so left/right steering no longer gets stuck.

Constraints:
- one PR purpose only
- smallest scoped valid change
- no repo-wide scanning
- no zip output from Codex
- keep 2D and networking untouched
- do not modify start_of_day

Implement:
1. Inspect samples/phase-16/1605/DrivingSandbox3DScene.js.
2. Fix the steering/input-state bug causing left/right navigation to stick.
3. Preserve current visible 3D output and forward/reverse behavior.
4. Add or extend the smallest targeted behavioral sanity check if useful.

Validate:
- verify left turn works while held
- verify right turn works while held
- verify steering stops when released
- verify opposite turn can be engaged immediately
- verify sample still renders on load
- run targeted smoke for 1605
- update:
  - docs/dev/reports/change_summary.txt
  - docs/dev/reports/validation_checklist.txt

Output:
- modify repo files directly
- do not create any zip
- keep commit-ready changes minimal
