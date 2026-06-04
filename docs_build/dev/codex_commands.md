# Codex Commands

Task:

- `PR_26154_037-archive-v1-v2-reference-material`

Changes:

- Read `.codex/skills/repo-build/SKILL.md`.
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Created `archive/v1-v2/`.
- Moved `old-tools/` to `archive/v1-v2/tools/`.
- Moved `old_games/` to `archive/v1-v2/games/`.
- Moved `old_samples/` to `archive/v1-v2/samples/`.
- Updated `docs_build/` references to the archive paths.
- Added archive ownership governance to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Confirmed active shared header/footer/toolbox navigation was not updated to point into the archive.
- Reported remaining root folders and ambiguous old-path references outside `docs_build/`.
- Did not modify `start_of_day/`.

Validation:

- Ran targeted reference checks for `old-tools`, `old_games`, `old_samples`, `archive/v1-v2`, and `tmp`.
- Ran active navigation checks for `archive/v1-v2` links.
- Ran static validation for changed Markdown, JSON, HTML, JS, and CSS paths.
- Ran `git diff --check`.
- Regenerated required Codex review artifacts.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_037-archive-v1-v2-reference-material_delta.zip`

Required reports:

- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/archive_v1_v2_reference_material_report.md`
- `docs_build/dev/reports/root_tree_cleanup_review_report.md`

Validation summary:

- PASS: `old-tools/`, `old_games/`, and `old_samples/` no longer exist at repository root.
- PASS: `archive/v1-v2/tools/`, `archive/v1-v2/games/`, and `archive/v1-v2/samples/` exist.
- PASS: archive counts are 363 tool files, 311 game files, and 1,580 sample files.
- PASS: `docs_build/` folder references now point to `archive/v1-v2/`; outside this PR's new report and handoff files, remaining old-name hits are historical `old_samples.js` filenames.
- PASS: active app navigation does not point into `archive/v1-v2/`.
- WARN: old-path strings remain outside `docs_build/` in active/ambiguous scripts, tests, toolbox, and engine/shared files; reported without changing runtime behavior.
- PASS: `git diff --check`.
- SKIPPED tests against `archive/v1-v2/` per request.
- SKIPPED full samples smoke test per request.
- SKIPPED `npm run test:workspace-v2` because active toolbox navigation did not change.
