# PR_26167_196-local-postgres-runtime-unblock

Status: PASS

## Branch Validation
- PASS - Current branch is `main`.
- PASS - `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before implementation.

## Summary
- Runtime and validation now load `.env` only for this lane.
- `scripts/validate-supabase-dev.mjs` validates the same `.env` database connection used by `npm run dev:local-api`.
- Removed the stale Docker/`127.0.0.1:5432` local Postgres helper path.
- Product data continues to use `GAMEFOUNDRY_DATABASE_URL`; Supabase URL/keys are used for Auth checks only.
- Game Workspace persistence now saves only Game Workspace-owned tables during Game Workspace repository mutations.
- Identity seed/bootstrap is idempotent against existing `roles.roleSlug` and remaps `user_roles.roleKey` to existing role keys.

## Requirement Checklist
- PASS - Main branch only: confirmed `main`.
- PASS - Project instructions read first.
- PASS - Runtime loads `.env` only.
- PASS - Validation loads `.env` only for `validate-supabase-dev` and local product-data validation.
- PASS - `.env.local`, `.env.uat`, and `.env.prod` are not auto-loaded by the touched runtime/validation paths.
- PASS - `.env.local` and `.env.uat` remain copy sources only.
- PASS - `validate-supabase-dev.mjs` validates the same `.env` file used by `npm run dev:local-api`.
- PASS - Database validation uses `GAMEFOUNDRY_DATABASE_URL` exactly from `.env`.
- PASS - Safe database diagnostics include host, port, and database name without password/secret values.
- PASS - Removed stale `127.0.0.1:5432` helper/check path and no touched path references `GAMEFOUNDRY_SUPABASE_DATABASE_URL`.
- PASS - Supabase URL/keys remain for Auth checks only.
- PASS - Product data remains on `GAMEFOUNDRY_DATABASE_URL`.
- PASS - Platform banner read/write validated against local Postgres.
- PASS - Supabase `platform_settings` was not updated by the banner save; validation saw zero Supabase REST table calls.
- PASS - Game Workspace create path validated against local Postgres with no 500.
- PASS - Browser code already guards active-game members before `.some()`, and the live API validation returned a valid `members` array.
- PASS - No provider variables, SQLite, mock-db/local-db path, Supabase REST product-data writes, or environment branching were introduced.

## Env Loading Evidence
- PASS - `.env` contains the requested local database components: host `192.168.2.5`, port `55432`, database `gamefoundry_dev`, user `postgres`; password was verified but not printed.
- PASS - `node .\scripts\validate-supabase-dev.mjs`: `Runtime .env validation load (4 key(s) loaded)`.
- PASS - `npm run dev:local-api` startup output: `.env loaded for API runtime (4 key(s) applied).`
- PASS - No touched runtime/validation path references `.env.local`, `.env.uat`, or `.env.prod`.

## Database Connection Evidence
- PASS - `Test-NetConnection 192.168.2.5 -Port 55432`: `TcpTestSucceeded=True`.
- PASS - `node .\scripts\validate-supabase-dev.mjs`: `Database connection (host=192.168.2.5; port=55432; database=gamefoundry_dev)`.
- PASS - `users`, `roles`, and `user_roles` table readiness were validated through `GAMEFOUNDRY_DATABASE_URL`.

## Banner Evidence
- PASS - `npm run validate:local-postgres-runtime` saved and read a platform banner through the API.
- PASS - Local Postgres `platform_settings` rows observed during validation: `3`.
- PASS - Validation cleanup restored prior banner rows after evidence capture.

## Supabase Not Updated Evidence
- PASS - `npm run validate:local-postgres-runtime` routed Supabase to an Auth-health-only fake endpoint.
- PASS - Supabase Auth health calls observed: `4`.
- PASS - Supabase `/rest/v1/platform_settings` calls observed: `0`.

## Game Workspace Evidence
- PASS - `npm run validate:local-postgres-runtime` created a new Game Workspace through the API and read it back with `getActiveGame`.
- PASS - Repository used: `game-workspace-1`.
- PASS - Local `game_workspace_games` validation rows observed: `1`.
- PASS - Validation cleanup removed the PR196 Game Workspace row.
- PASS - No HTTP 500 occurred after narrowing Game Workspace persistence to `game_workspace_*` tables.

## Validation Lane Report
- PASS - `node --check scripts/validate-supabase-dev.mjs`.
- PASS - `node --check scripts/validate-local-postgres-runtime.mjs`.
- PASS - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`.
- PASS - `node --check src/dev-runtime/persistence/postgres-connection-client.mjs`.
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`.
- PASS - `.env` database component check for `192.168.2.5:55432/gamefoundry_dev`.
- PASS - `Test-NetConnection 192.168.2.5 -Port 55432`.
- PASS - `npm run validate:local-postgres-runtime`.
- PASS - `node .\scripts\validate-supabase-dev.mjs`.
- PASS - `npm run dev:local-api` startup check.
- PASS - `npm run validate:browser-env-agnostic`.
- PASS - `node --test tests/dev-runtime/ProductDataDatabaseUrl.test.mjs`.
- PASS - `git diff --check`.
- SKIP - Full samples smoke intentionally not run; not in scope.

## Manual Validation Notes
- Runtime API startup was checked on port `5596` to avoid conflicts; this does not change runtime env loading behavior.
- The local runtime validation applies grouped DDL, seeds identity rows, validates banner and Game Workspace paths, then cleans up its banner/game validation records.
- No secrets were printed in reports or command summaries.
- Artifact: `tmp/PR_26167_196-local-postgres-runtime-unblock_delta.zip`.
