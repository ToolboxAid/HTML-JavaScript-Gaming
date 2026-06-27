# PR_26158_027 SQLite Local DB Report

## Executive Summary

Replaced the server-side JSON-backed Local DB adapter with a real SQLite-backed Local DB adapter using Node's `node:sqlite` runtime. Browser code remains on the existing server API boundary, Local Mem behavior is unchanged, and Admin DB Viewer continues to inspect Local DB in read-only mode through `/api/mock-db/snapshot`.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | Instructions were read before implementation. |
| Replace JSON-backed Local DB with real SQLite-backed Local DB. | PASS | `src/dev-runtime/server/mock-api-router.mjs` imports `node:sqlite` and persists Local DB state into physical SQLite tables. |
| Keep Local DB behind server API boundary only. | PASS | SQLite implementation lives under `src/dev-runtime/server`; browser files continue to call server API clients/routes only. |
| Browser code must not import SQLite, DB repositories, dev-runtime persistence, or DB implementation modules directly. | PASS | Static boundary checks returned no browser matches for `node:sqlite`, `DatabaseSync`, `LocalDbAdapter`, `src/dev-runtime`, or mock repositories. |
| Preserve Local Mem behavior unchanged. | PASS | AdminDbViewer Local Mem Playwright coverage passed. |
| Preserve Admin DB Viewer read-only Local DB inspection through API. | PASS | AdminDbViewer Local DB Playwright coverage passed with no write controls visible. |
| Local DB initializes required tables/schemas deterministically. | PASS | SQLite contract probe verified physical SQLite tables and schema columns. |
| Empty tables remain visible with headers in Admin DB Viewer. | PASS | SQLite contract probe and AdminDbViewer Playwright verified empty tables and headers. |
| Initialization, read, write, and snapshot failures fail visibly with actionable diagnostics. | PASS | Contract probe verified disabled SQLite snapshot/write diagnostics with `Local DB adapter not configured`, `SQLite`, and `GAMEFOUNDRY_LOCAL_DB_DISABLE`. |
| Do not add UAT/Prod API adapter behavior. | PASS | UAT/Prod remain deployment-only metadata; no UAT/Prod adapter implementation was added. |
| Do not expose UAT or Prod as local login choices. | PASS | `/api/session/modes` validation returned only `Local Mem` and `Local DB`. |
| Do not modify `start_of_day` folders. | PASS | No `start_of_day` files changed. |

## Implementation Notes

| Area | Evidence |
| --- | --- |
| SQLite adapter | `LocalDbAdapter` now opens `DatabaseSync`, initializes `__gf_metadata`, creates one SQLite table per known mock DB table, adds deterministic schema columns, and stores JSON-encoded cell values to preserve booleans/arrays/objects. |
| Default storage | Local DB defaults to `tmp/local-db/local-db-state.sqlite`; `GAMEFOUNDRY_LOCAL_DB_PATH` still overrides it for tests and local diagnostics. |
| Failure diagnostics | `GAMEFOUNDRY_LOCAL_DB_DISABLE=1` blocks initialization/read/write and returns visible server API diagnostics. |
| Session mode copy | Local DB description now says `Uses LocalDbAdapter backed by server SQLite storage.` |
| Tests | AdminDbViewer and LoginSessionMode test storage paths now use `.sqlite` files. |

## Validation Evidence

| Validation | Result |
| --- | --- |
| Changed-file syntax checks | PASS |
| Local DB/API SQLite contract validation | PASS |
| AdminDbViewer Playwright | PASS, 7/7 |
| LoginSessionMode Playwright | PASS, 5/5 |
| Static import boundary audit | PASS |
| Active source/test JSON-backed wording check | PASS |
| `git diff --check` | PASS, Git line-ending warnings only |

## Remaining Migration Notes

- Node emitted its standard experimental warning for `node:sqlite`; the implementation remains server/dev-runtime only and does not affect browser bundles.
- UAT/Prod remain deployment-only adapter contract metadata and were not implemented in this PR.
