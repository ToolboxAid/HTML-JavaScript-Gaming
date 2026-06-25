# PR_26175_DELTA_008-api-client-service-coverage

## Summary

Team Delta expanded API client service coverage using the page/service testing model from PR_26175_DELTA_006 and the runtime lane discipline continued in PR_26175_DELTA_007.

This PR adds `npm run test:service:api` as a service-level lane for shared API client behavior. It reuses the existing Node test-file runner, keeps `npm test` as the site-wide/all-tests command, and does not create any team-specific test runner or Delta-named command.

## Scope

- Team: Delta
- Branch: `PR_26175_DELTA_008-api-client-service-coverage`
- Runtime code changed: `src/api/session-api-client.js`
- Tests changed: `tests/dev-runtime/ServerApiClientStandardization.test.mjs`
- Test command changed: `package.json`
- UI changed: none
- New test runner: none
- Team-named command: none

## Coverage Added

The new `test:service:api` lane covers:

- Shared server API request routing through configured `apiUrl`
- Static-only server API route failures
- Server tool constants and function calls
- Server repository client initialization and method routing
- Blocked repository validation when server initialization fails
- Session logout data-boundary handling
- Existing public API URL client coverage

## Runtime Impact

PASS - Runtime behavior change is limited to fixing `logoutSessionUser()` to use the existing `requireSessionApiData(...)` server boundary instead of an undefined helper. The API remains backward compatible and now returns standardized session data or restore guidance.

## Requirement Checklist

| Requirement | Status | Notes |
|---|---|---|
| One PR purpose only | PASS | API client service coverage only. |
| Team Delta ownership only | PASS | Shared runtime/API client testability is Delta-owned. |
| Branch from updated main | PASS | Branch created after PR_007 merge and main sync. |
| Expand API client service coverage | PASS | Added `test:service:api` and expanded shared API client tests. |
| Reuse existing test infrastructure | PASS | Reuses `scripts/run-node-test-files.mjs`. |
| Add/update `test:service:api` only if needed | PASS | A focused API service lane did not exist. |
| Do not create team-specific commands | PASS | No Delta-named npm command added. |
| Do not add a new test runner | PASS | Existing runner reused. |
| Do not duplicate PR_006 or PR_007 | PASS | Adds API service coverage, separate from page/service lane setup and runtime coverage. |
| Keep `npm test` site-wide/all-tests | PASS | Existing `npm test` remains unchanged. |
| No unrelated cleanup | PASS | Changes are limited to API coverage and the covered API boundary fix. |
| No UI changes | PASS | No UI files changed. |
| No browser-owned product data | PASS | No browser persistence or product JSON contracts changed. |
| No silent fallbacks or hidden defaults | PASS | Tests assert explicit server API errors and restore guidance. |

## Validation Lane Report

| Command | Status | Notes |
|---|---|---|
| `node --check src/api/session-api-client.js` | PASS | Syntax valid. |
| `node --check tests/dev-runtime/ServerApiClientStandardization.test.mjs` | PASS | Syntax valid. |
| `npm run test:service:api` | PASS | 2/2 targeted Node test files passed, 13 tests passed. |
| Package command assertion | PASS | `npm test` and `test:service:api` present; `test:delta-runtime` absent. |
| Delta harness absence check | PASS | `scripts/run-delta-runtime-validation.mjs` absent. |
| Delta command grep | PASS | No matches for Delta-named test commands in package scripts, scripts, source, or dev-runtime tests. |
| `git diff --check` | PASS | No whitespace errors. |

## Manual Validation Notes

- Confirmed `npm test` still points to `node ./scripts/run-node-tests.mjs`.
- Confirmed `test:service:api` is page/service-level and not team-owned.
- Confirmed no Team Delta-specific validation harness was added.
- Confirmed the session logout client now uses the same server data-boundary helper used by sign-in and current-session reads.
- Playwright was not run because this PR changes shared API client service coverage and no browser UI files.

## ZIP

Repo-structured delta ZIP:

`tmp/PR_26175_DELTA_008-api-client-service-coverage_delta.zip`
