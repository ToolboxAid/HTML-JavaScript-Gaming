MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_17_12_SAMPLE_1606_PHYSICS_PLAYGROUND_IMPLEMENTATION.

Goal:
Implement a real, testable improvement to Sample 1606 so the physics playground visibly demonstrates gravity, bounce, and multi-object motion.

Constraints:
- one PR purpose only
- smallest scoped valid change
- no repo-wide scanning
- no zip output from Codex
- keep 2D and networking untouched
- do not modify start_of_day

Implement:
1. Inspect samples/phase-16/1606/PhysicsPlayground3DScene.js.
2. Increase visible gravity and bounce clarity.
3. Ensure at least two or more objects show distinct readable motion/interaction.
4. Keep camera/render readability simple and stable.
5. Extend tests/runtime/Phase16VisibilitySanity.test.mjs only if a surgical targeted check is useful.
6. Update docs/dev/reports/change_summary.txt and docs/dev/reports/validation_checklist.txt.

Validate:
- verify 1606 renders visible 3D content on load
- verify gravity is visually obvious
- verify bounce is clearly visible
- verify multiple objects show distinct motion/interaction
- run targeted smoke for 1606
- run targeted affected sanity check
- verify no 2D regression in targeted checks
- verify no networking regression in targeted checks

Output:
- modify repo files directly
- do not create any zip
- keep commit-ready changes minimal
