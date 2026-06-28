# BUILD PR_26170_013-game-journey-friendly-descriptions

## Purpose

Update Toolbox Game Journey grouped accordion summaries to show creator-friendly workflow descriptions.

## Scope

- Update only the grouped Toolbox accordion summary labels.
- Use literal `xxx%` in every accordion summary.
- Preserve the existing Game Journey workflow group order.
- Preserve existing accordion open/close behavior.
- Preserve existing group data attributes and grouping behavior.
- Add targeted Playwright coverage that validates the exact accordion label order and text.

## Out Of Scope

- Completion calculations.
- Progress logic.
- Status text such as `Complete`, `In Progress`, or `Not Started`.
- Tool card group labels.
- Runtime/database behavior.
- Samples validation.

## Validation

- Verify current branch is `main`.
- Run `node --check` for touched JavaScript files.
- Run targeted static checks for the exact friendly accordion labels.
- Run targeted Toolbox/Game Journey Playwright validation for grouped accordion rendering.
- Skip samples validation.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26170_013-game-journey-friendly-descriptions.md`
- `tmp/PR_26170_013-game-journey-friendly-descriptions_delta.zip`
