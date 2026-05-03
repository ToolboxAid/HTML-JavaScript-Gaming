# PLAN_PR_11_320

## Purpose
Update the Workspace V2 Playwright gate script to run the installed Playwright command path only, without install/bootstrap behaviors.

## Scope
- `package.json`
- `scripts/run-workspace-v2-playwright-gate.mjs`
- `docs/dev/reports/PR_11_320_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Add an explicit script for the installed Playwright command path.
2. Update gate runner to execute that command through Node/npm CLI path (no install/bootstrap).
3. Preserve fail-fast non-zero exit and pass/fail summary output.
4. Keep results/report behavior under `tests/results/**` via existing Playwright config.
5. Run required parse/syntax/test validations.
