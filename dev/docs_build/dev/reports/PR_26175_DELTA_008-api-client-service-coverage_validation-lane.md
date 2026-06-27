# PR_26175_DELTA_008 Validation Lane

## Commands

```powershell
node --check src/api/session-api-client.js
node --check tests/dev-runtime/ServerApiClientStandardization.test.mjs
npm run test:service:api
$pkg = Get-Content -Raw package.json | ConvertFrom-Json; if ($pkg.scripts.PSObject.Properties.Name -contains 'test:delta-runtime') { throw 'test:delta-runtime exists' }; if (-not ($pkg.scripts.PSObject.Properties.Name -contains 'test')) { throw 'npm test missing' }; if (-not ($pkg.scripts.PSObject.Properties.Name -contains 'test:service:api')) { throw 'test:service:api missing' }; if ($pkg.scripts.test -ne 'node ./scripts/run-node-tests.mjs') { throw 'npm test changed unexpectedly' }
if (Test-Path scripts/run-delta-runtime-validation.mjs) { throw 'unexpected delta runtime script' }
rg -n "delta-runtime|run-delta-runtime|test:delta" package.json scripts src/api tests/dev-runtime
git diff --check
```

## Results

| Command | Status |
|---|---|
| `node --check src/api/session-api-client.js` | PASS |
| `node --check tests/dev-runtime/ServerApiClientStandardization.test.mjs` | PASS |
| `npm run test:service:api` | PASS |
| Package command assertion | PASS |
| Delta harness absence check | PASS |
| Delta command grep | PASS - no matches |
| `git diff --check` | PASS |

## API Service Files

`npm run test:service:api` passed:

- `tests/dev-runtime/ServerApiClientStandardization.test.mjs`
- `tests/dev-runtime/PublicApiUrlClient.test.mjs`

## Browser / Playwright

SKIP - No browser UI files changed.

