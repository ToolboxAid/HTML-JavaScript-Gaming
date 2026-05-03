# PLAN_PR_11_319

## Purpose
Promote Workspace V2 Playwright UI coverage into a required validation gate command with explicit pass/fail handling.

## Scope
- `package.json`
- `scripts/run-workspace-v2-playwright-gate.mjs`
- `docs/dev/reports/PR_11_319_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Add `npm run test:workspace-v2` script entry.
2. Implement a dedicated gate runner that executes Playwright and prints clear pass/fail summary counts.
3. Enforce non-zero exit on any execution or test failure.
4. Keep Playwright output/report behavior using existing `tests/results/**` configuration.
5. Run targeted syntax checks for changed JS/CJS files.
