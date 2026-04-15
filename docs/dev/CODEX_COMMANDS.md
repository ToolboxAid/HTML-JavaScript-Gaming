MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_17_8_SAMPLES_1605_TO_1608_CORE_TRACK.

Goal:
Complete the remaining core Phase 16 / 3D sample track by implementing samples 1605 through 1608 as one testable package.

Context:
- 1601 is visible
- 1602 and 1604 visibility defects were fixed
- targeted Phase 16 visibility sanity passes
- targeted smoke for 1601-1604 passes

Constraints:
- one PR purpose only
- smallest scoped valid change
- no repo-wide scanning
- no zip output from Codex
- keep 2D and networking untouched
- do not modify start_of_day
- preserve prior Phase 16 samples unless a shared safe improvement is required

Implement:
1. Add and wire up:
   - samples/phase-16/1605
   - samples/phase-16/1606
   - samples/phase-16/1607
   - samples/phase-16/1608
2. Reuse existing shared Phase 16 helpers where stable.
3. Ensure each sample has visible 3D output on first load and one clear teaching purpose:
   - 1605 driving sandbox
   - 1606 physics playground
   - 1607 space shooter
   - 1608 dungeon crawler
4. Update samples/index.html so these are live entries when implemented.
5. Extend the existing targeted Phase 16 runtime sanity only if needed and keep it surgical.

Validation:
- verify 1605 visible on load
- verify 1606 visible on load
- verify 1607 visible on load
- verify 1608 visible on load
- verify intended controls function for each sample
- run targeted smoke for 1601-1608
- confirm no 2D regression in targeted checks
- confirm no networking regression in targeted checks
- update:
  - docs/dev/reports/change_summary.txt
  - docs/dev/reports/validation_checklist.txt

Output:
- modify repo files directly
- do not create any zip
- keep commit-ready changes minimal
