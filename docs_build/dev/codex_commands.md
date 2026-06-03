# Codex Commands

Task:

- `PR_26154_030-toolbox-nav-character-closeout`

Changes:

- Read `.codex/skills/repo-build/SKILL.md`.
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Used `PR_26154_029-theme-v2-root-rename` as the current baseline.
- Updated shared Theme V2/toolbox character styling in `assets/theme-v2/css/panels.css`.
- Kept the character image on the left by preserving the existing ToolDisplayMode DOM order.
- Confirmed 15px character-to-content spacing through the existing `--space-15` token.
- Updated the stale aggregate Theme V2 selector in `assets/theme-v2/css/gamefoundrystudio.css`.
- Updated `assets/theme-v2/partials/header-nav.html` so all active toolbox tool pages appear in the Toolbox navigation.
- Added Toolbox nav submenus for multi-tool groups, including Audio with MIDI and Sound.
- Added route-map entries for Tool Builder and Tool Creator in `assets/theme-v2/js/gamefoundry-partials.js`.
- Removed Marketplace from the active toolbox index data in `toolbox/tools-page-accordions.js`.
- Kept Marketplace in the header and footer as a product/capability destination outside Toolbox.
- Did not modify `old-tools/`, `old_games/`, `old_samples/`, or `start_of_day/`.

Validation:

- Ran targeted reference checks for `toolbox/index.html`, `toolbox/tools-page-accordions.js`, shared header nav, Marketplace entries, `.tool-display-mode__character`, and `assets/theme-v2` paths.
- Ran template consistency audit after the Toolbox nav update.
- Ran static validation for changed HTML, JS, CSS, JSON, and Markdown files.
- Ran changed JavaScript syntax checks.
- Ran `npm run test:workspace-v2`.
- Ran `git diff --check`.
- Ran `npm run codex:review-artifacts`.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_030-toolbox-nav-character-closeout_delta.zip`

Required reports:

- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/toolbox_nav_character_closeout_report.md`
- `docs_build/dev/reports/template_consistency_after_toolbox_nav_report.md`

Validation summary:

- PASS active toolbox header coverage: `20/20`.
- PASS Marketplace removed from `toolbox/index.html` rendered data.
- PASS Marketplace remains in footer Product column.
- PASS `.tool-display-mode__character` is 150px by 150px in shared Theme V2 styling.
- PASS 15px character spacing is present through `--space-15`.
- PASS zero active references remain to the retired Theme V2 root path.
- PASS post-change template audit: public/root pages `43/43`, active toolbox pages `20/20`.
- PASS `npm run test:workspace-v2`.
- PASS `git diff --check`.
- SKIPPED tests against `old-tools/`, `old_games/`, and `old_samples/` per request.
- SKIPPED full samples smoke test per request.
