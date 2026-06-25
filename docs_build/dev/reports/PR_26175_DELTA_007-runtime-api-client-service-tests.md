# PR_26175_DELTA_007-runtime-api-client-service-tests

## Summary

Team Delta added service-level API client coverage for the standardized Browser -> Server API -> Data Source boundary.

This PR fixes the session logout API client to use the same `requireServerApiData(...)` unwrap path as the other session client calls. It also adds targeted tests proving logout uses the configured server API URL, returns `payload.data`, and preserves the session-specific restore guidance when server data is missing.

## Scope

- Team: Delta
- Branch: `PR_26175_DELTA_007-runtime-api-client-service-tests`
- Runtime file changed: `src/api/session-api-client.js`
- Test file changed: `tests/dev-runtime/ServerApiClientStandardization.test.mjs`
- Service test command added: `npm run test:service:api-client`
- Site-wide command preserved: `npm test`

## Runtime Impact

PASS - Session logout now follows the standardized server-data boundary instead of calling an undefined helper.

## API / Data Impact

PASS - No API routes or persisted data contracts changed. The browser API client still calls `/session/logout` with `POST` and reads server-owned `payload.data`.

## Requirement Checklist

| Requirement | Status | Notes |
|---|---|---|
| One PR purpose only | PASS | API client service testability only. |
| Team Delta ownership only | PASS | API clients and runtime test coverage are Delta-owned. |
| No team-specific test runner | PASS | No Delta-named runner or command added. |
| No `scripts/run-delta-runtime-validation.mjs` | PASS | File was not added. |
| No `test:delta-runtime` | PASS | Script was not added. |
| Testing organized by service/page level | PASS | Added `test:service:api-client`. |
| Keep `npm test` as site-wide command | PASS | Existing `npm test` is unchanged. |
| No UI changes | PASS | No UI files changed. |
| No browser-owned product data | PASS | Test stubs only the server API response; no persisted browser data source added. |
| No silent fallbacks or hidden defaults | PASS | Missing server data still throws explicit restore guidance. |

## Validation Lane Report

| Command | Status | Notes |
|---|---|---|
| `node --check src/api/session-api-client.js` | PASS | API client syntax valid. |
| `node --check tests/dev-runtime/ServerApiClientStandardization.test.mjs` | PASS | Test syntax valid. |
| `npm run test:service:api-client` | PASS | 1 targeted file, 6 tests passed. |
| `git diff --check` | PASS | No whitespace errors. |
| `npm run codex:review-artifacts` | PASS | Regenerated `codex_review.diff` and `codex_changed_files.txt`. |

## Manual Validation Notes

- Confirmed `package.json` keeps `npm test` unchanged.
- Confirmed no Team Delta-specific validation command was introduced.
- Confirmed session logout test uses mocked server API data instead of browser-owned persisted state.
- Playwright was not run; this is a Node service/API-client coverage change.

## ZIP

Expected repo-structured delta ZIP:

`tmp/PR_26175_DELTA_007-runtime-api-client-service-tests_delta.zip`

