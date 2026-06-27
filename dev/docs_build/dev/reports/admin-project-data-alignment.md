# Admin Project Data Alignment

Stack item: PR_26155_050-admin-project-data-alignment

## Summary
- Updated `toolbox/index.html` so the role simulation banner reuses the existing Theme V2 `section-head` row pattern.
- Kept the admin banner text on the left and the `Project Data ▾` menu on the right side of the same banner row.
- Project Data controls remain admin-only through the existing role simulation behavior.

## Validation Notes
- Impacted lane: `project-workspace`.
- PASS: `npm run test:lane:project-workspace`.
- PASS: `git diff --check`.
- Skipped lanes: `tool-runtime`, `workspace-contract`, `game-runtime`, `integration`, `engine-src`, `samples`, and full samples smoke.
- Skipped-lane rationale: this PR only changes the Project Workspace/Toolbox banner and Project Workspace page layout behavior; it does not change engine runtime, games, samples, cross-tool launch behavior, or shared Theme V2 CSS.

## Manual Test Notes
- Verified in targeted Playwright that `?role=admin` shows the admin banner and Project Data menu on the same row.
- Verified Project Data remains hidden for `?role=guest` and `?role=user`.
- Verified no new CSS was added; existing Theme V2 classes support the row alignment.
