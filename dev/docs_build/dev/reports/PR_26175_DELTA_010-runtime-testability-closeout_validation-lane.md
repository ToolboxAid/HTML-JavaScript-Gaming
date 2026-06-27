# PR_26175_DELTA_010 Validation Lane

## Commands

```powershell
npm run test:service:runtime
npm run test:service:api
$pkg = Get-Content -Raw package.json | ConvertFrom-Json; if ($pkg.scripts.test -ne 'node ./scripts/run-node-tests.mjs') { throw 'npm test changed unexpectedly' }; if ($pkg.scripts.PSObject.Properties.Name -contains 'test:delta-runtime') { throw 'test:delta-runtime exists' }
if (Test-Path scripts/run-delta-runtime-validation.mjs) { throw 'unexpected delta runtime script' }
rg -n "delta-runtime|run-delta-runtime|test:delta" package.json scripts
Test-Path docs_build/dev/reports/PR_26175_DELTA_010-runtime-testability-closeout.md
Test-Path docs_build/dev/reports/PR_26175_DELTA_010-final-team-delta-completion-report.md
git diff --check
```

## Results

| Command | Status |
|---|---|
| `npm run test:service:runtime` | PASS |
| `npm run test:service:api` | PASS |
| Package command assertion | PASS |
| Delta harness absence check | PASS |
| Delta command grep | PASS - no matches in package/scripts |
| Required report verification | PASS |
| `git diff --check` | PASS |

## Site-Wide Command

`npm test` remains the single site-wide/all-tests command path and was not changed by PR_010.

## Browser / Playwright

SKIP - Report-only closeout; no browser UI files changed.
