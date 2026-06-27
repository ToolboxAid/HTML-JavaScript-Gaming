# Tool Layout Width Standard

Stack item: PR_26155_053-tool-layout-width-standard

## Summary
- Added `Tool Layout Width Standard` guidance to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Documented that Theme V2 tool pages are designed for 1440px and larger.
- Documented 1440px as the minimum comfortable desktop width and 1920px as the ideal desktop width.
- Documented the tool page structure as left margin, left panel, center panel, right panel, and right margin.

## Theme V2 Gap Finding
- Gap: existing `.container` is capped at the normal public-page max width, which is too narrow for first-class tool pages at 1440px and 1920px.
- Resolution: added reusable Theme V2 layout tokens/classes in the active Theme V2 import path:
  - `--tool-wide-container-max`
  - `--tool-wide-container-width`
  - `--tool-wide-workspace-columns`
  - `--tool-wide-workspace-left-collapsed-columns`
  - `--tool-wide-workspace-right-collapsed-columns`
  - `--tool-wide-workspace-both-collapsed-columns`
  - `.container--tool-wide`
  - `.tool-workspace--wide`
- No page-local CSS, tool-local CSS, inline styles, or per-tool width rules were added.

## Validation Notes
- Playwright impacted: Yes.
- Impacted lane: `project-workspace`.
- PASS: `npm run test:lane:project-workspace`.
- PASS: `npm run test:workspace-v2`; command name is legacy, user-facing language remains Project Workspace.
- PASS: `git diff --check`.
- Skipped lanes: `tool-runtime`, `game-runtime`, `integration`, `engine-src`, `samples`, and full samples smoke.
- Skipped-lane rationale: this PR adds reusable public Theme V2 layout classes and validates the affected Project Workspace/Learn surfaces; it does not change engine runtime, games, samples, or cross-tool integration behavior.

## Manual Test Notes
- Verified Project Workspace uses the reusable wide tool layout class.
- Verified no inline styles or page-local CSS were introduced.
- Verified no new DB, auth, cloud, or persistence behavior was added.
