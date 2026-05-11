# PR_26130_024-text-to-speech-v2-fullscreen-scroll-and-workspace-tile

## Scope

- Updated Text to Speech V2 runtime gender filtering, fullscreen/internal scroll layout, and workspace empty-launch handling.
- Updated Workspace Manager V2 tile hydration so Text to Speech V2 is enabled once Repo and Game are selected, without requiring a Text to Speech-specific payload.
- Updated Workspace Manager V2 Playwright coverage for the requested Text to Speech V2 filters, layout scroll behavior, and tile availability.

## Changes

- Gender filtering now presents `Any`, `Male`, `Female`, and `Neutral`.
- `Any` keeps all voices available.
- `Male` filters to male-classified voices only.
- `Female` filters to female-classified voices only.
- `Neutral` filters to neutral/unknown voices only.
- Neutral is treated as a runtime filter; persisted payload gender remains schema-compatible because this PR intentionally made no schema changes.
- Text to Speech V2 workspace launches with no payload now render a safe empty state instead of failing before the tile can open.
- Fullscreen right/center panels constrain Output Summary, Status, and Named Sentences content with internal scrolling.
- Text to Speak accordion toggle coverage was added, and Speak/Pause/Resume/Stop controls are centered with bottom padding.

## Validation

- `npm run test:workspace-v2` passed: 33 tests passed.
- `git diff --check` passed with line-ending normalization warnings only.
- Full samples smoke test skipped because the BUILD explicitly requested not to run it; scope is limited to Workspace Manager V2 and Text to Speech V2.

## Reports

- Review diff: `docs/dev/reports/codex_review.diff`
- Changed files: `docs/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26130_024-text-to-speech-v2-fullscreen-scroll-and-workspace-tile_delta.zip`
