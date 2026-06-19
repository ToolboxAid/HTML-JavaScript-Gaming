# PR_26169_026-local-api-startup-url-logging Report

## Summary

Fixed misleading local API startup logging in `scripts/start-local-api-server.mjs`. The startup output now reports the API bind URL separately from configured public site/API URLs and no longer appends `/account/sign-in.html` to the API runtime URL.

## Branch Guard

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current branch | `main` | `main` | PASS |
| Local branches found | includes `main` | `main` | PASS |

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Log API runtime server bind URL separately | `formatStartupLogLines()` first line is `GameFoundry API runtime server running at ${localServer.baseUrl}`. | PASS |
| Log configured site URL from `GAMEFOUNDRY_SITE_URL` | Startup formatting prints `Configured site URL: ...`. | PASS |
| Missing site URL shows `(not configured)` | `tests/dev-runtime/LocalApiStartupLogging.test.mjs` covers missing site URL. | PASS |
| Log configured API URL from `GAMEFOUNDRY_API_URL` | Startup formatting prints `Configured API URL: ...` when env value is present. | PASS |
| Missing API URL derives default from bind URL plus `/api` | Targeted test covers `http://127.0.0.1:5599/api` derived from bind URL. | PASS |
| Preserve `.env` load, auth connection, database connection, SSL mode, stop logs | Targeted test asserts all required log lines and order. | PASS |
| Do not change bind behavior | `startLocalApiServer({ host, port })` remains driven by existing `GAMEFOUNDRY_LOCAL_API_HOST` / `GAMEFOUNDRY_LOCAL_API_PORT` defaults. | PASS |
| Do not expose secrets | Targeted test passes secret-like env values and asserts they do not appear in logs. | PASS |
| Do not touch unrelated app areas | Only startup script, targeted test, and required docs/reports changed. | PASS |

## Validation

| Command | Result |
| --- | --- |
| `git branch --show-current` | PASS, `main` |
| `node --check scripts/start-local-api-server.mjs` | PASS |
| `node --check tests/dev-runtime/LocalApiStartupLogging.test.mjs` | PASS |
| `node --test tests/dev-runtime/LocalApiStartupLogging.test.mjs` | PASS, 2 tests |

## Manual Startup Shape

Expected configured output shape after this PR:

```text
GameFoundry API runtime server running at http://127.0.0.1:5501
Configured site URL: http://127.0.0.1:5500
Configured API URL: http://127.0.0.1:5501/api
.env loaded for API runtime (... key(s) applied).
Configured auth connection: ...
Configured database connection: ...
Database SSL mode: ...
Press Ctrl+C to stop.
```

## Lane Decisions

| Lane | Decision |
| --- | --- |
| Runtime/startup logging | Executed targeted Node syntax and startup-log unit validation. |
| Browser/UI/API behavior | Skipped; no browser, route, auth, membership, marketplace, owner, admin, or banner runtime behavior changed. |
| Samples | Skipped; samples are not in scope and were not touched. |
