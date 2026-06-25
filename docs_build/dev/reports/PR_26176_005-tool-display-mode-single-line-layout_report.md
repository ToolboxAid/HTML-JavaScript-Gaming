# PR_26176_005-tool-display-mode-single-line-layout Report

## Scope Source
- Active request: finalize existing branch `PR_26176_005-tool-display-mode-single-line-layout`.
- Branch gate: current branch confirmed as `PR_26176_005-tool-display-mode-single-line-layout`; no `PR_26176_006` or `PR_26176_007` branch was created.
- Worktree review: modified and untracked files were reviewed; accidental/unneeded `PR_26176_001` through `PR_26176_004` untracked report artifacts were removed.
- Note: `docs_build/dev/BUILD_PR.md` still describes `PR_26175_ALFA_047-theme-v2-svg-icon-registry`, so the user prompt was treated as the operative BUILD scope for this PR.

## Summary
- Updated the shared Tool Display Mode template so the `<summary>` directly owns the badge, tool name, character image, and fullscreen/exit-fullscreen icon in that order.
- Kept the fullscreen/exit-fullscreen theme icon as the final direct child of `<summary>`, gold, 2.6x the base layout icon, and anchored to the far right with `margin-left: auto`.
- Removed the old Tool Display Mode chevron, stacked body/identity/description layout, and rendered navigation row UI.
- Removed `nav.tool-display-mode__navigation-row`, `Previous: {tool}`, `Next: {tool}`, and CSS/JS used solely to render or populate that row.
- Normal mode now displays both shared platform banner placements, `data-platform-banner-placement="header"` and `data-platform-banner-placement="footer"`.
- Fullscreen mode keeps the header-placement platform banner visible, including `.platform-banner__inner` and the `Development Environment` message.
- Fullscreen mode hides the footer-placement platform banner with `data-platform-banner-placement="footer"`.
- Fullscreen mode hides the main site navigation container, `.site-header > div.container.nav`, including the brand/home navigation.
- Shared fullscreen CSS targets the banner placement attribute and does not target `.platform-banner__inner`.
- Fullscreen mode hides the character image, renders the badge at 64x64, centers the growing tool name, and keeps the exit icon anchored far right.
- Narrowed the focused Playwright validation to Tool Display Mode behavior only and renamed it to `ToolDisplayModeSingleLineLayout.spec.mjs`.
- Removed older PR_26176_001/002 validation assertions and style changes for horizontal accordion color and footer status icon sizing from this branch.

## Changed Files
- `assets/theme-v2/js/tool-display-mode.js`
- `assets/theme-v2/css/accordion.css`
- `assets/theme-v2/css/layout.css`
- `assets/theme-v2/css/panels.css`
- `assets/theme-v2/css/status.css`
- `tests/playwright/tools/ToolDisplayModeSingleLineLayout.spec.mjs`
- `docs_build/dev/reports/PR_26176_005-tool-display-mode-single-line-layout_report.md`
- `docs_build/dev/reports/PR_26176_005-tool-display-mode-single-line-layout_branch-validation.md`
- `docs_build/dev/reports/PR_26176_005-tool-display-mode-single-line-layout_validation-lane.md`
- `docs_build/dev/reports/PR_26176_005-tool-display-mode-single-line-layout_requirements-checklist.md`
- `docs_build/dev/reports/PR_26176_005-tool-display-mode-single-line-layout_manual-validation-notes.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Validation
- `node --check assets/theme-v2/js/tool-display-mode.js`
- `node --check tests/playwright/tools/ToolDisplayModeSingleLineLayout.spec.mjs`
- `npx playwright test tests/playwright/tools/ToolDisplayModeSingleLineLayout.spec.mjs --workers=1`
- `git diff --check`

## Notes
- No individual toolbox pages were modified.
- The previous fullscreen rule that hid `.platform-banner__inner` was removed.
- No `PR_26176_006` or `PR_26176_007` branch/artifact was created during this finalization pass.
- Game Journey completion metrics SQLite/Postgres behavior was not changed; that warning is documented as Golf-owned external storage migration work outside this PR.
- The focused Playwright run uses deterministic route fixtures for public config, platform banner settings, registry metadata, game-design constants, and minimal game-design repository calls.
