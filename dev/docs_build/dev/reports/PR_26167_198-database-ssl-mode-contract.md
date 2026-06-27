# PR_26167_198-database-ssl-mode-contract

Status: PASS

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.

## Summary
- Added `GAMEFOUNDRY_DATABASE_SSL` as the authoritative database SSL mode for runtime/product-data Postgres access.
- Supported modes are `disable` and `require`.
- Removed URL/host-derived SSL mode selection and removed TLS/TCP fallback behavior.
- Runtime, validator, and DDL apply now visibly report the configured database SSL mode.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Hard-stopped branch check passed on `main`.
- PASS: Added authoritative `GAMEFOUNDRY_DATABASE_SSL` contract.
- PASS: Supported values limited to `disable` and `require`.
- PASS: No TLS-then-TCP fallback remains.
- PASS: No TCP-then-TLS fallback remains.
- PASS: `scripts/validate-supabase-dev.mjs` validates and reports database SSL mode.
- PASS: `scripts/apply-supabase-dev-ddl.mjs` validates and reports database SSL mode.
- PASS: Runtime database connection code validates and uses `GAMEFOUNDRY_DATABASE_SSL`.
- PASS: Product-data database access readiness requires `GAMEFOUNDRY_DATABASE_SSL`.
- PASS: Runtime startup reports database SSL mode.
- PASS: SSL/server mismatch fails visibly with actionable diagnostics.
- PASS: Did not reintroduce provider variables.
- PASS: Did not create DEV/UAT/PROD branching.
- PASS: Connection behavior is driven by `GAMEFOUNDRY_DATABASE_URL` and `GAMEFOUNDRY_DATABASE_SSL`.
- PASS: No SQLite/local-db/mock-db fallback added.

## SSL Mode Contract Evidence
- Validator output includes: `PASS - Database SSL mode: disable`.
- DDL output includes: `PASS - Database SSL mode: disable`.
- Runtime startup output includes: `Database SSL mode: disable`.
- Negative mismatch check with `GAMEFOUNDRY_DATABASE_SSL=require` against the plain local Postgres listener exited with code `1` and reported: `PostgreSQL server did not accept TLS negotiation. If this database target is a plain local Postgres listener, set GAMEFOUNDRY_DATABASE_SSL=disable.`

## Local Postgres Validation Evidence
- `GAMEFOUNDRY_DATABASE_SSL=disable` was used for validation.
- `node .\scripts\validate-supabase-dev.mjs` PASS:
  - Database SSL mode configured.
  - Database SSL mode: disable.
  - Database connection PASS.
  - `users` table PASS.
  - `roles` table PASS.
  - `user_roles` table PASS.
- `node .\scripts\apply-supabase-dev-ddl.mjs` PASS:
  - Database SSL mode: disable.
  - DDL connection mode selected from `GAMEFOUNDRY_DATABASE_SSL`: plain TCP.
  - Applied 15 grouped GFS DDL files.

## Validation Lane Report
- PASS: `node --check src\dev-runtime\persistence\postgres-connection-client.mjs`.
- PASS: `node --check src\dev-runtime\auth\provider-contract-stubs.mjs`.
- PASS: `node --check scripts\validate-supabase-dev.mjs`.
- PASS: `node --check scripts\apply-supabase-dev-ddl.mjs`.
- PASS: `node --check scripts\start-local-api-server.mjs`.
- PASS: `GAMEFOUNDRY_DATABASE_SSL=disable node .\scripts\validate-supabase-dev.mjs`.
- PASS: `GAMEFOUNDRY_DATABASE_SSL=disable node .\scripts\apply-supabase-dev-ddl.mjs`.
- PASS: `npm run dev:local-api` startup check.
- PASS: Controlled mismatch check failed visibly for `GAMEFOUNDRY_DATABASE_SSL=require` against local plain TCP Postgres.
- PASS: Forbidden-marker scan for old `sslmode`, provider variables, SQLite/local-db/mock-db, and copy-source env auto-load markers in changed active files.
- PASS: `git diff --check`.
- SKIP: Full samples smoke; PR scope is database SSL mode configuration/runtime validation only.

## Manual Validation Notes
- Runtime startup check used a bounded background job on port `5598` and was stopped after capturing startup output.
- Startup output confirmed:
  - `Configured auth connection: configured`.
  - `Configured database connection: configured`.
  - `Database SSL mode: disable`.
- No secrets, connection strings, `.env`, or copy-source env files were added to the ZIP.

## Artifact Output
- PASS: Repo-structured ZIP created at `tmp/PR_26167_198-database-ssl-mode-contract_delta.zip`.

## Changed Files
- `.env.example`
- `scripts/apply-supabase-dev-ddl.mjs`
- `scripts/start-local-api-server.mjs`
- `scripts/validate-supabase-dev.mjs`
- `src/dev-runtime/auth/provider-contract-stubs.mjs`
- `src/dev-runtime/persistence/postgres-connection-client.mjs`
- `docs_build/dev/reports/PR_26167_198-database-ssl-mode-contract.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
