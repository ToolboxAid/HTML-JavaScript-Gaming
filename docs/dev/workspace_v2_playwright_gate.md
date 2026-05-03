# Workspace V2 Playwright Validation Gate

Use this gate for repeatable local validation of Workspace V2 UI behavior.

## Command
- `npm run test:workspace-v2`

## What It Runs
- Executes the installed Playwright UI regression command for Workspace V2.
- Fails fast and returns a non-zero exit code on any test failure.

## Output Paths
- Test artifacts are written under `tests/results/`.
- Trace artifacts are written under `tests/results/**` (for example in artifacts folders).
- HTML report is written under `tests/results/report`.
- Reporter auto-open behavior is controlled by `playwright.config.cjs`.

## Pass/Fail Behavior
- Success:
  - tests complete
  - summary shows pass count
  - exit code is `0`
- Failure:
  - any failed test causes non-zero exit
  - summary includes failed count
  - CI/local gate should treat this as a hard failure

## Smoke Test Policy
- For Workspace V2 gate-only PRs, full samples smoke test should be skipped.
- Run full samples smoke only when shared sample framework/runtime is changed.
