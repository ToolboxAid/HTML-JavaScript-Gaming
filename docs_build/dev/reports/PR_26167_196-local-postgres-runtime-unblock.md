# PR_26167_196-local-postgres-runtime-unblock

Status: BLOCKED

## Branch Validation
- PASS - Current branch is `main`.
- PASS - `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before implementation.

## Summary
- Added `npm run dev:local-postgres` to start a Docker-backed local Postgres container for `postgresql://postgres:postgres@127.0.0.1:5432/gamefoundry_dev`.
- Added `npm run validate:local-postgres-runtime` to load only `.env`, apply grouped DDL, seed server-side identity rows, save/read platform banner through the API, assert no Supabase product-data REST call, and exercise Game Workspace create/getActiveGame.
- Extended the direct Postgres client with a raw query method for setup/validation SQL.
- Kept platform settings out of tool snapshot persistence so Game Workspace saves do not overwrite banner-owned rows.

## Requirement Checklist
- PASS - Main branch only: confirmed `main`.
- PASS - Project instructions read first.
- PASS - Continued PR_26167_195 direct database URL product-data path.
- PASS - Added smallest local Postgres setup/run path: `npm run dev:local-postgres`.
- PASS - Did not reintroduce SQLite, mock-db, local-db, provider switching, or Supabase REST product-data writes.
- PASS - Supabase URL/keys remain auth-only for runtime Auth checks; product-data adapter uses `GAMEFOUNDRY_DATABASE_URL`.
- PASS - `platform_settings` banner API path remains owned by the configured database adapter.
- PASS - Game Workspace active-game browser logic already avoids `undefined.some`; server still rejects malformed `getActiveGame` payloads visibly.
- PASS - Runtime startup still loads only `.env`.
- PASS - No environment branching gate passed for active code.
- BLOCKED - Live local Postgres connection validation could not complete because nothing accepted connections at `127.0.0.1:5432`.
- BLOCKED - Live local banner save/read and Game Workspace create validation did not run because the database connection failed first.

## Local Postgres Evidence
- Added helper: `npm run dev:local-postgres`.
- Helper uses Docker container `gamefoundry-local-postgres`, image `postgres:16`, database `gamefoundry_dev`, and host port `127.0.0.1:5432`.
- Docker Desktop launch was requested, but Docker CLI readiness calls hung and timed out.
- `Test-NetConnection 127.0.0.1 -Port 5432`: `TcpTestSucceeded=False`.
- `npm run validate:local-postgres-runtime`: BLOCKED with `connect ECONNREFUSED 127.0.0.1:5432`.

## Banner Evidence
- Static/unit evidence: `tests/dev-runtime/ProductDataDatabaseUrl.test.mjs` passed and proves `platform_settings` reads/writes call the configured Postgres client, not Supabase REST.
- Runtime guard added: `scripts/validate-local-postgres-runtime.mjs` asserts `Supabase platform_settings REST calls=0` after a banner save/read.
- BLOCKED - The live banner save/read path did not reach execution because local Postgres was unavailable.

## Supabase Not Updated Evidence
- PASS - Product-data adapter no longer uses Supabase REST table writes.
- PASS - Local runtime validation script routes Supabase to an Auth-health-only fake endpoint and fails if `/rest/v1/platform_settings` is called.
- BLOCKED - Live zero-call assertion was not reached because local Postgres refused the connection before API validation began.

## Game Workspace Evidence
- PASS - `toolbox/game-workspace/game-workspace.js` uses `activeGameMembers(activeGame)` before `.some()`, so missing/malformed active game data does not throw `undefined.some`.
- PASS - Server repository method validation still rejects malformed `getActiveGame` responses with a visible error.
- PASS - Tool snapshot persistence now excludes global/platform tables including `platform_settings`.
- BLOCKED - Live Game Workspace create/getActiveGame validation did not run because local Postgres was unavailable.

## Validation Lane Report
- PASS - `node --check scripts/start-local-postgres.mjs`.
- PASS - `node --check scripts/validate-local-postgres-runtime.mjs`.
- PASS - `node --check src/dev-runtime/persistence/postgres-connection-client.mjs`.
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`.
- PASS - `node --test tests/dev-runtime/ProductDataDatabaseUrl.test.mjs`.
- PASS - `npm run validate:browser-env-agnostic`.
- PASS - `git diff --check`.
- BLOCKED - `npm run dev:local-postgres` did not complete because Docker CLI readiness calls timed out.
- BLOCKED - `npm run validate:local-postgres-runtime` failed with `ECONNREFUSED 127.0.0.1:5432`.
- SKIP - Full samples smoke intentionally not run; not in scope.

## Manual Validation Notes
- To unblock live validation, start Docker Desktop until `docker info` returns promptly, then run `npm run dev:local-postgres`.
- With Postgres listening, run `npm run validate:local-postgres-runtime`.
- The validation script restores banner rows and deletes its `PR196 Runtime Game <pid>` row after execution.
- No secrets were printed in this report.
