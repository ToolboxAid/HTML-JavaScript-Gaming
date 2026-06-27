# PLAN_PR_11_318C

## Purpose
Redirect Playwright outputs away from default folders into `tests/results/**` with scoped config-only changes.

## Scope
- `playwright.config.cjs`
- `docs_build/dev/reports/PR_11_318C_report.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

## Steps
1. Update Playwright config output paths to `tests/results/**`.
2. Keep existing execution behavior options (`headless:false`, `slowMo`, `trace:on`).
3. Ensure `npx playwright test` uses UI test lane only and avoids writing to `test-results/` or `playwright-report/`.
4. Run required validation commands.
