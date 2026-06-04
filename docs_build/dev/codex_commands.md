# Codex Commands

Task:

- `PR_26154_034-toolbox-inventory-convergence`
- `PR_26154_035-theme-v2-asset-wiring-closeout`
- `PR_26154_036-legacy-ownership-final-audit`

Changes:

- Read `.codex/skills/repo-build/SKILL.md`.
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Used `PR_26154_031-033-template-test-root-polish` as the current baseline.
- Inventoried all 20 active `toolbox/[toolname]/index.html` pages.
- Added missing active toolbox index entries for Configuration Admin, Tool Builder, and Tool Creator.
- Confirmed active toolbox pages are header-wired, index-wired, and template-marker complete.
- Audited `assets/theme-v2` CSS, fonts, images, JS, and partials.
- Confirmed Font Awesome is wired through `assets/theme-v2/fonts/fontawesome`.
- Moved deprecated preview-generator support from `toolbox/shared/preview/` to `old-tools/shared-preview/`.
- Classified toolbox, old-tools, games, old_games, old_samples, scripts, and tests ownership.
- Did not modify `start_of_day/`.

Validation:

- Ran targeted active toolbox inventory checks.
- Ran targeted Theme V2 reference resolution checks.
- Ran targeted retired path checks for `assets/theme/v2`, `assets/theme-v2/assets`, `assets/theme-v2/css/styles.css`, `favicon.ico`, and `GameFoundryStudio/`.
- Ran active reference check for `toolbox/shared/preview/` after moving it.
- Ran `node --check toolbox/tools-page-accordions.js`.
- Ran `npm run test:playwright:static`.
- Ran `npm run test:workspace-v2`.
- Ran `git diff --check`.
- Regenerated required Codex review artifacts.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_034-036-toolbox-theme-legacy-audit_delta.zip`

Required reports:

- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/toolbox_inventory_convergence_report.md`
- `docs_build/dev/reports/theme_v2_asset_wiring_closeout_report.md`
- `docs_build/dev/reports/legacy_ownership_final_audit_report.md`
- `docs_build/dev/reports/final_remaining_cleanup_inventory.md`

Validation summary:

- PASS active toolbox inventory: `20/20` header-wired, `20/20` index-wired, `20/20` template-marker complete.
- PASS toolbox index group order and in-group tool order are alphabetical.
- PASS active Theme V2 file references resolve on disk.
- PASS no active dependency on `assets/theme-v2/css/styles.css`.
- PASS no active imports of `toolbox/shared/preview/` remain after the move.
- PASS `npm run test:playwright:static`.
- PASS `npm run test:workspace-v2` with `2 passed`.
- PASS `git diff --check`.
- SKIPPED tests against `old-tools/`, `old_games/`, and `old_samples/` per request.
- SKIPPED full samples smoke test per request.
