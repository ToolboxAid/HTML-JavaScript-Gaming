# Codex Commands

Task:

- `PR_26154_031-toolbox-template-mismatch-closeout`
- `PR_26154_032-active-test-suite-reconciliation`
- `PR_26154_033-root-structure-final-polish`

Changes:

- Read `.codex/skills/repo-build/SKILL.md`.
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Used the latest applied PR state as the baseline.
- Re-ran template consistency checks for active public/root pages and active toolbox pages.
- Updated stale grouping CSS copy in `admin/grouping-colors.html` and `docs_build/account/grouping-colors.html`.
- Removed deprecated-only tests for old games, old samples, removed V2 tool pages, removed integration surfaces, and old template/tool registries.
- Rewired active test lane metadata to `tests/playwright/tools/RootToolsFutureState.spec.mjs`.
- Updated Playwright structure ownership metadata and V8 coverage entry-point labels for `toolbox/` and `assets/theme-v2/`.
- Confirmed Marketplace is absent from `toolbox/index.html` and `toolbox/tools-page-accordions.js`.
- Confirmed shared header/footer still keep Marketplace as a product destination.
- Did not modify `old-tools/`, `old_games/`, `old_samples/`, or `start_of_day/`.

Validation:

- Ran changed JavaScript syntax checks:
  - `node --check scripts/run-targeted-test-lanes.mjs`
  - `node --check scripts/audit-playwright-test-locations.mjs`
  - `node --check tests/run-tests.mjs`
  - `node --check tests/helpers/playwrightV8CoverageReporter.mjs`
- Ran template consistency audit:
  - Public/root pages: `43/43`
  - Active toolbox pages: `20/20`
- Ran targeted stale reference checks for `toolbox`, `assets/theme-v2`, footer/header links, `styles.css`, `favicon.ico`, `assets/theme/v2`, `GameFoundryStudio/`, `src/engine/theme`, removed `tools/` routes, and removed `samples/` routes.
- Ran active toolbox index ordering and header coverage checks.
- Ran direct removed-samples import/route scan in active tests.
- Ran `npm run test:playwright:static`.
- Ran `npm run test:workspace-v2`.
- Ran `git diff --check`.
- Regenerated required Codex review artifacts.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_031-033-template-test-root-polish_delta.zip`

Required reports:

- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/toolbox_template_mismatch_closeout_report.md`
- `docs_build/dev/reports/active_test_suite_reconciliation_report.md`
- `docs_build/dev/reports/root_structure_final_polish_report.md`
- `docs_build/dev/reports/remaining_cleanup_report.md`

Validation summary:

- PASS template audit: public/root pages `43/43`.
- PASS template audit: active toolbox pages `20/20`.
- PASS active toolbox header coverage: `20/20`.
- PASS Marketplace is absent from active toolbox index data.
- PASS active public pages do not use `assets/theme-v2/css/styles.css`.
- PASS zero active public `tools/` route references remain.
- PASS `npm run test:playwright:static`.
- PASS `npm run test:workspace-v2` with `2 passed`.
- PASS `git diff --check`.
- SKIPPED tests against `old-tools/`, `old_games/`, and `old_samples` per request.
- SKIPPED full samples smoke test per request.
