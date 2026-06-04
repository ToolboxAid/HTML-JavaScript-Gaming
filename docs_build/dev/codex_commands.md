# Codex Commands

Task:

- `PR_26154_038-docs-archive-test-output-cleanup`

Changes:

- Read `.codex/skills/repo-build/SKILL.md`.
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Used `PR_26154_037-archive-v1-v2-reference-material` as baseline.
- Confirmed `assets/theme/` is gone and did not recreate it.
- Consolidated `docs_build/archive/` into `archive/v1-v2/docs_build/archive/`.
- Moved `docs_build/pr/PR_10_*` and `docs_build/pr/PR_11_*` files and folders into `archive/v1-v2/docs_build/pr/`.
- Moved `docs_build/design/tools/*` into `archive/v1-v2/tool-design-reference/`.
- Updated current `docs_build/` references to the new archive paths.
- Updated Playwright output paths from `tests/results/` to `tmp/test-results/`.
- Moved existing generated `tests/results/` content into `tmp/test-results/`.
- Updated `.gitignore` to explicitly ignore `tmp/test-results/`.
- Audited `toolbox/shared/`, `toolbox/dev/`, and `toolbox/schemas/`; no clear legacy-only files were moved.
- Did not modify `scripts/untracked/`.
- Did not move `node_modules/` or root `package.json`.

Validation:

- Ran targeted reference checks for `docs_build/archive`, `docs_build/pr/PR_10_`, `docs_build/pr/PR_11_`, `docs_build/design/tools`, `archive/v1-v2`, `toolbox/shared`, `toolbox/dev`, `toolbox/schemas`, `tests/results`, `tmp/test-results`, `node_modules`, and `.gitignore`.
- Ran static validation for changed HTML, JS, CSS, JSON, Markdown, and config files.
- Ran `npm run test:workspace-v2` because test output configuration changed.
- Ran `git diff --check`.
- Verified active-path reference scans outside audit reports and handoff files.
- Regenerated required Codex review artifacts.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_038-docs-archive-test-output-cleanup_delta.zip`

Required reports:

- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/docs_archive_test_output_cleanup_report.md`
- `docs_build/dev/reports/toolbox_shared_dev_schema_audit_report.md`

Validation summary:

- PASS: `assets/theme/` is absent.
- PASS: `docs_build/archive/`, `docs_build/design/tools/`, and `docs_build/pr/PR_10_*` / `PR_11_*` active locations are cleared.
- PASS: archive destinations exist with moved content.
- PASS: `tests/results/` generated content moved to ignored `tmp/test-results/`.
- PASS: `node_modules/` is ignored and was not moved.
- PASS: delta ZIP exists with required reports and no `tmp/` entries.
- PASS: `npm run test:workspace-v2`.
- PASS: `git diff --check`.
- SKIPPED tests against `archive/v1-v2/`.
- SKIPPED full samples smoke test.
