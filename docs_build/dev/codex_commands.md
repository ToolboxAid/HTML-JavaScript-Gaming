# Codex Commands

## PR_26154_048-050

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Replaced `toolbox/toolRegistry.js` with active toolbox entries only.
- Deleted unused `toolbox/renderToolsIndex.js`.
- Deleted deprecated `tests/tools/ToolHostDispatchContract.test.mjs` and removed it from `tests/run-tests.mjs`.
- Deleted obsolete registry-era validators:
  - `scripts/validate-project-system.mjs`
  - `scripts/validate-starter-project-template.mjs`
- Moved `archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep/` to `archive/v1-v2/tools/SpriteEditor_old_keep/`.
- Moved `docs_build/tools/tools-index-registry/` to `archive/v1-v2/docs_build/tools/tools-index-registry/`.
- Updated active runtime/shared path references from `old_games` and `old_samples` to `archive/v1-v2/games` and `archive/v1-v2/samples`.
- Updated active tests and fixtures to assert archive paths.
- Updated active guard scripts to use current `toolbox` ownership.

Validation:
- `node scripts/validate-tool-registry.mjs`
- `npm run test:workspace-v2`
- `git diff --check`
- `node --check` for changed active JS/MJS files.
- JSON parse for changed active JSON files.
- Targeted reference checks for `toolbox/toolRegistry.js`, `toolbox/renderToolsIndex.js`, `toolbox/code`, `SpriteEditor_old_keep`, `old_games`, `old_samples`, `old-tools`, `tools/`, `samples/`, `assets/theme/v2`, and `archive/v1-v2`.

Required reports:
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/toolbox_registry_final_cleanup_report.md`
- `docs_build/dev/reports/archive_policy_final_alignment_report.md`
- `docs_build/dev/reports/legacy_alias_removal_closeout_report.md`
- `docs_build/dev/reports/migration_done_status_report.md`

## PR_26154_051

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Ran final active-path checks for `tools/`, `samples/`, `old-tools`, `old_games`, `old_samples`, `assets/theme/v2`, `src/engine/theme`, `favicon.ico`, and `styles.css`.
- Ignored `archive/v1-v2/`, `tmp/`, and generated review artifacts for active stale-path classification.
- Fixed the remaining active README reference from `old_samples/index.html` to `archive/v1-v2/samples/index.html`.
- Generated local review artifacts when possible and documented their handling.
- Created the repo-structured delta ZIP at `tmp/PR_26154_051-final-done-check-no-review-artifact-blocker_delta.zip`.

Validation:
- Targeted active-path reference checks.
- `git diff --check`
- `node --check playwright.config.cjs`
- UTF-8/read validation for changed Markdown, text, and JS/CJS files.
- `npm run test:workspace-v2` skipped because active toolbox launch/navigation/runtime behavior did not change.
- Full samples smoke test skipped per request.
- Tests against `archive/v1-v2/` skipped per request.

Required reports:
- `docs_build/dev/reports/final_done_check_report.md`
- `docs_build/dev/reports/review_artifact_handling_report.md`

## PR_26154_052

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Confirmed active Theme V2 CSS links use `assets/theme-v2/css/theme.css`.
- Confirmed `assets/theme-v2/css/styles.css` had no active runtime/page/template/tool references.
- Deleted inactive `assets/theme-v2/css/styles.css` from active Theme V2 ownership.
- Re-ran active-path checks for `tools/`, `samples/`, `old-tools`, `old_games`, `old_samples`, `assets/theme/v2`, `src/engine/theme`, `favicon.ico`, and `styles.css`.
- Documented archive-only `styles.css` references without changing archive behavior.
- Generated local review artifacts; artifact files remain ignored by `.gitignore`.
- Created the repo-structured delta ZIP at `tmp/PR_26154_052-theme-css-entrypoint-closeout_delta.zip`.

Validation:
- Targeted Theme V2 CSS entrypoint reference validation.
- Targeted final active-path reference validation.
- `git diff --check`
- Static UTF-8/read validation for changed Markdown/text files and deleted CSS status.
- `npm run test:workspace-v2` skipped because active toolbox launch/navigation/runtime behavior did not change and no active references changed.
- Full samples smoke test skipped per request.
- Tests against `archive/v1-v2/` skipped per request.

Required reports:
- `docs_build/dev/reports/theme_css_entrypoint_closeout_report.md`
- `docs_build/dev/reports/migration_final_status_report.md`
