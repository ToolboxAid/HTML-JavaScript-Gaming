# PLAN_PR_11_318E

## Purpose
Enable automatic opening of the Playwright HTML report after targeted UI test runs.

## Scope
- `playwright.config.cjs`
- `docs/dev/reports/PR_11_318E_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Update Playwright HTML reporter setting to `open: "always"`.
2. Preserve existing execution settings:
   - `headless: false`
   - `slowMo`
   - `trace: "on"`
   - `outputDir: "tests/results"`
3. Run required targeted validations.
