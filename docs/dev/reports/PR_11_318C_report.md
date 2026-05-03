# PR_11_318C Report

## Purpose
Move Playwright outputs from defaults into `tests/results/**` via config-only changes.

## Files Changed
- `playwright.config.cjs`
- `docs/pr/PR_11_318C_PLAYWRIGHT_OUTPUT_DIRS/PLAN_PR.md`
- `docs/pr/PR_11_318C_PLAYWRIGHT_OUTPUT_DIRS/BUILD_PR.md`
- `docs/dev/reports/PR_11_318C_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Implementation Summary
- Config now routes Playwright outputs under `tests/results/**`:
  - test artifacts: `tests/results/artifacts`
  - HTML report: `tests/results/report`
- Kept existing run options:
  - `headless: false`
  - `slowMo: 500`
  - `trace: "on"`
- Scoped Playwright discovery to `tests/ui` to run UI specs only when invoking `npx playwright test`.

## Validation Commands
- `node --check playwright.config.cjs` -> **PASS**
- `npx playwright test` -> **PASS**

## Output Verification
- `tests/results/` exists -> **YES**
- `tests/results/report/index.html` exists -> **YES**
- `tests/results/artifacts/.../trace.zip` exists -> **YES**
- `test-results/` created -> **NO**
- `playwright-report/` created -> **NO**

## Constraint Note
- A direct combination of `outputDir = tests/results` and HTML reporter `outputFolder = tests/results/report` is rejected by Playwright due folder-clash protection.
- Final config keeps all output in `tests/results/**` without using default output folders.
