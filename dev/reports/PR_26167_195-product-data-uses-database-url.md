# PR_26167_195-product-data-uses-database-url

## Branch Validation
- PASS - Current branch is `main`.
- PASS - `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before changes.

## Requirement Checklist
- PASS - Investigated the platform banner data path.
- PASS - Root cause: `SupabasePostgresProviderAdapter.requestTable()` was using `GAMEFOUNDRY_SUPABASE_URL/rest/v1` with the service-role key for product-data table reads/writes.
- PASS - Added a server-side direct PostgreSQL client that reads `GAMEFOUNDRY_DATABASE_URL`.
- PASS - Updated the product-data adapter so table reads/writes use the configured database client, not Supabase REST.
- PASS - `platform_settings` read/write now flows through `GAMEFOUNDRY_DATABASE_URL`.
- PASS - Supabase URL/keys remain in the Auth adapter path only.
- PASS - Runtime `.env` loading behavior was not changed.
- PASS - No local-db/mock-db/SQLite fallback was added.
- PASS - No DEV/UAT/PROD branching was added; environment-agnostic validation passed.
- PASS - No secrets were printed in validation output or this report.
- FAIL - Live local Postgres validation could not complete because nothing is listening on `127.0.0.1:5432`.
- FAIL - Saving a platform banner and verifying local `platform_settings` update could not complete until local Postgres is running.
- FAIL - Supabase-not-updated live evidence could not be completed through an actual banner save because the configured local database connection refused connections before any write.

## Files Changed
- `src/dev-runtime/auth/provider-contract-stubs.mjs`
- `src/dev-runtime/persistence/postgres-connection-client.mjs`
- `tests/dev-runtime/ProductDataDatabaseUrl.test.mjs`
- `docs_build/dev/reports/environment_agnostic_browser_gate_report.md`
- `docs_build/dev/reports/PR_26167_195-product-data-uses-database-url.md`

## Local Postgres Evidence
- PASS - `.env` contains `GAMEFOUNDRY_DATABASE_URL` pointing at host `127.0.0.1`, port `5432`, database `gamefoundry_dev`; username/password presence was verified without printing values.
- FAIL - Direct configured database read of `platform_settings` returned `ECONNREFUSED 127.0.0.1:5432`.
- FAIL - API-level `GET /api/platform-settings/banner` returned HTTP 500 with an `ECONNREFUSED` diagnostic from the configured database connection.
- BLOCKED - `POST /api/admin/platform-settings/banner` was not run because the read path already proved the configured database is unavailable.

## Supabase-Not-Updated Evidence
- PASS - Static code evidence: `src/dev-runtime/auth/provider-contract-stubs.mjs` and `src/dev-runtime/persistence/postgres-connection-client.mjs` contain no `/rest/v1/` product-data path after the fix.
- PASS - Focused unit evidence: `tests/dev-runtime/ProductDataDatabaseUrl.test.mjs` verifies `platform_settings` calls `postgresClient.requestTable()` for POST and GET.
- BLOCKED - Live UAT before/after row comparison was not performed because this PR must not write product data through Supabase and the configured local database connection is unavailable.

## Validation Notes
- PASS - `node --check src/dev-runtime/persistence/postgres-connection-client.mjs`
- PASS - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS - `node --check tests/dev-runtime/ProductDataDatabaseUrl.test.mjs`
- PASS - `node --test tests/dev-runtime/ProductDataDatabaseUrl.test.mjs`
- PASS - `npm run validate:browser-env-agnostic`
- FAIL - Connection validation with `.env` local Postgres: `ECONNREFUSED 127.0.0.1:5432`.
- FAIL - Platform banner save/read local Postgres validation: blocked by local Postgres connection refusal.
- FAIL - Targeted platform banner live validation: blocked by local Postgres connection refusal.
- FAIL - Targeted Game Workspace create live validation: blocked by local Postgres connection refusal.
- SKIP - Full samples smoke was not run, per request.

## Completion Status
- BLOCKED - PR is not complete because required live validation cannot pass until local Postgres is running on `127.0.0.1:5432` with the `gamefoundry_dev` schema available.
