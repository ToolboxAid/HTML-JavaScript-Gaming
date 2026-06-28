# PR_26180_OWNER_009-move-api-application Report

## Executive Summary

PASS. This PR moves server/API application runtime from `src/dev-runtime/` into top-level `api/` while preserving public `/api/*` route behavior.

The move keeps developer-only local bootstrap/orchestration in `dev/` for the later local-runtime PR. Browser-facing API client modules remain in `src/api/`; `www/` does not import top-level `api/` implementation files directly.

## Scope Completed

- Moved Local API server runtime, router, route helpers, services, persistence, database, storage, auth, seed, guest seed, marketplace, membership, legal, messages, project package, team, testing, and toolbox API server modules under `api/`.
- Renamed `src/dev-runtime/DEV_RUNTIME_BOUNDARY.md` to `api/API_RUNTIME_BOUNDARY.md` and updated boundary language.
- Left `src/dev-runtime/admin/` in place as the documented legacy Admin Notes browser-viewer compatibility path.
- Updated dev scripts, targeted tests, Playwright helpers, and active governance docs to reference `api/`.
- Updated Project Instructions version to `2026.06.28.009`.
- Updated `BACKLOG_MASTER.md` to show Repository Architecture Simplification at 40% with next milestone `dev/local-runtime/`.

## Public Behavior

- `/api/*` route behavior is preserved.
- Public browser URLs are preserved.
- No product feature behavior was intentionally changed.
- No API endpoint rename was introduced.
- Browser code continues to use API/service contracts through client modules, not direct server implementation imports.

## Notes

- The first route smoke attempt included `/api/session/users`, which returned 503 because that route depends on configured provider/session-user data. The final smoke used provider-independent API routes and passed.
- Targeted Playwright initially exposed a stale test-local static server assumption from the prior `www/` move. The spec now uses the shared static route resolver, preserving public routes while serving from `www/`.
