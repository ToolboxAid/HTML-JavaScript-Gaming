# Codex Commands

Task:

- `PR_26154_039-builder-consolidation`
- `PR_26154_040-toolbox-shared-dev-final-classification`
- `PR_26154_041-active-surface-closeout`

Changes:

- Read `.codex/skills/repo-build/SKILL.md`.
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Used `PR_26154_038-docs-archive-test-output-cleanup` as baseline.
- Kept `toolbox/game-design/` as the authoritative active builder/design surface.
- Moved duplicate active builder surfaces into `archive/v1-v2/tools/game-builder-reference/`.
- Removed Game Builder and Tool Builder from active header navigation, route maps, Toolbox index grouping, current docs references, and active contract fixtures.
- Moved `toolbox/shared/` to `src/shared/toolbox/`.
- Moved `toolbox/schemas/` to `src/shared/schemas/`.
- Moved `toolbox/dev/` to `docs_build/dev/toolbox/`.
- Updated imports, package scripts, schema references, tests, docs_build references, and validation helpers for the new ownership paths.
- Updated `scripts/validate-active-tools-surface.mjs` to validate the current active Toolbox folders, header menu, route map, and Toolbox index grouping.
- Did not modify `start_of_day/`.
- Did not run tests against `archive/v1-v2/`.
- Did not run the full samples smoke test.

Validation:

- Ran targeted builder reference checks outside archive/history/report paths.
- Ran targeted checks for retired active folders: `toolbox/builder`, `toolbox/game-builder`, `toolbox/shared`, `toolbox/dev`, and `toolbox/schemas`.
- Ran changed-file static validation for JS/MJS/CJS syntax, JSON parsing, and changed HTML inline style/script/event restrictions outside archive.
- Ran `npm run check:shared-extraction-guard`.
- Ran `node scripts/validate-active-tools-surface.mjs`.
- Ran `npm run test:workspace-v2` because active Toolbox navigation changed.
- Ran `git diff --check`.
- Regenerated required Codex review artifacts.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_039-041-builder-shared-active-closeout_delta.zip`

Required reports:

- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/builder_consolidation_report.md`
- `docs_build/dev/reports/toolbox_shared_dev_final_classification_report.md`
- `docs_build/dev/reports/active_surface_closeout_report.md`

Validation summary:

- PASS: duplicate Game Builder and Tool Builder active surfaces removed from active Toolbox wiring.
- PASS: shared/dev/schema ownership moved out of active Toolbox.
- PASS: active Toolbox inventory contains 18 reachable end-user tool pages.
- PASS: Workspace V2 targeted lane.
- PASS: shared extraction guard.
- PASS: changed-file static validation.
- PASS: `git diff --check`.
- SKIPPED: archive validation and full samples smoke test.
