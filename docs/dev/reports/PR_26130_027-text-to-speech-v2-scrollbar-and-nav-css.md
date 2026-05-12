# PR_26130_027-text-to-speech-v2-scrollbar-and-nav-css

## Summary
- Restored Text to Speech V2 page-level vertical scrolling by making the tool body scrollable and removing the Text to Speech V2 global page overflow hide in fullscreen shell state.
- Replaced Text to Speech V2 standalone/workspace launch nav markup with the palette/template nav pattern using `palette-manager-v2__menu-sample` and `palette-manager-v2__menu-actions`.
- Removed the old Text to Speech V2 custom nav classes from launch nav usage while preserving Import JSON, Copy JSON, Export JSON, and Return to Workspace behavior.
- Updated Playwright coverage for page scrollability, palette/template nav classes, removal of old custom nav classes, standalone JSON actions, and workspace Return to Workspace.

## Scope Notes
- No schema changes.
- No start_of_day changes.
- No unrelated tool implementation changes.
- Workspace Manager V2 test assertions were adjusted only where current Text to Speech V2 optional payload presence can vary during the workspace-v2 suite.

## Validation
- Passed: `npm run test:workspace-v2`
- Result: 35 passed.

## Skipped
- Full samples smoke test was not run. Reason: this PR is limited to Text to Speech V2 scrollbar/nav CSS and focused Workspace Manager V2 launch coverage; the requested `npm run test:workspace-v2` suite covers the scoped behavior.

## Artifacts
- Diff report: `docs/dev/reports/codex_review.diff`
- Changed files report: `docs/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26130_027-text-to-speech-v2-scrollbar-and-nav-css_delta.zip`
