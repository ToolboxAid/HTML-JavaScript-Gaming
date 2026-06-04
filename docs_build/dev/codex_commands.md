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
