# Static Validation Report

Generated: 2026-05-26
PR: PR_26146_027-static-validation-before-playwright-launch

## Summary

Status: PASS
Prevented launches: 0
Fast-fail reasons: none

## Static Validation Runs

| Command | Status | Browser Launch | Reason |
| --- | --- | --- | --- |
| `npm run test:playwright:static` | PASS | No | Required first validation pass. Ran structure audit and lane runner static checks without starting Playwright. |
| `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lanes integration,tool-runtime` | PASS | Yes, after static pass | Re-ran the same static gate inside the lane runner before affected Playwright lanes started. |

## Checks

| Check | Status | Details |
| --- | --- | --- |
| test placement validation | PASS | Covered by `docs/dev/reports/playwright_structure_audit.md`. |
| lane ownership validation | PASS | Playwright specs are separated under tools, games, integration, and optional engine ownership buckets. |
| invalid filename detection | PASS | No game-specific spec/helper filenames remain in generic reusable tool/helper locations. |
| invalid lane target detection | PASS | Selected lanes target existing files under their expected lane directories. |
| missing fixture detection | PASS | Workspace contract fixture path exists; selected affected lanes use explicit repo/game fixtures. |
| missing import detection | PASS | Relative imports in Playwright specs and shared helpers resolve. |
| Windows quoting hazard detection | PASS | Tool-runtime grep pipe is passed as a literal Node argv value. |
| duplicate lane registration detection | PASS | No duplicate npm `test:lane:*` registrations were found. |
| invalid grep pattern detection | PASS | No empty or malformed grep patterns were found. |

## Fast-Fail Behavior

- Deterministic structural failures would stop before Playwright CLI invocation.
- Browser startup is blocked when lane targets, imports, fixtures, placement, registration, or quoting checks fail.
- Workspace V2 is not launched by static validation.
- No automatic retries are performed for deterministic setup failures.

## Runtime Savings Observations

- Static validation ran before any browser work.
- Affected lanes were run together through one Node lane-runner process.
- Tool-runtime now combines Preview Generator V2 and Collision Inspector V2 in one Playwright CLI invocation.
- Workspace contract, engine/src, samples, and full samples smoke were skipped because they were outside the affected surface.
