# PR_26167_197-ddl-apply-supports-local-postgres

Status: PASS

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.

## Summary
- Updated `scripts/apply-supabase-dev-ddl.mjs` to load `.env`, use `GAMEFOUNDRY_DATABASE_URL`, and reuse the shared Postgres connection client.
- Removed the script-local TLS-only PostgreSQL client and Supabase REST grant behavior from DDL apply.
- Updated `scripts/validate-local-postgres-runtime.mjs` so local runtime validation accepts the configured local/private Postgres endpoint from `.env` instead of a hardcoded port.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Hard-stopped check passed on `main`.
- PASS: DDL apply loads `.env`; output: `.env loaded for DDL apply (5 key(s) applied)`.
- PASS: DDL apply uses `GAMEFOUNDRY_DATABASE_URL` as the only DDL database connection source.
- PASS: DDL apply supports local plain TCP; output: `plain TCP (sslmode=disable)`.
- PASS: DDL apply supports TLS-capable targets through URL `sslmode` and target capability handling in the shared Postgres client.
- PASS: Did not reintroduce `GAMEFOUNDRY_SUPABASE_DATABASE_URL`.
- PASS: Did not reintroduce provider variables.
- PASS: Did not add environment-name branching.
- PASS: Applied grouped GFS DDL to local Postgres: 15 DDL files applied.
- PASS: Required identity tables validated: `users`, `roles`, `user_roles`.
- PASS: `platform_settings` banner save/read validated through API against local Postgres.
- PASS: Game Workspace create/getActiveGame validated with no 500 and no `undefined.some` error.
- PASS: No SQLite/local-db/mock-db fallback added.

## Env Load Evidence
- `node .\scripts\apply-supabase-dev-ddl.mjs`
- PASS: `.env loaded for DDL apply (5 key(s) applied)`.
- PASS: Database diagnostic printed only safe context: `host=192.168.2.5; port=55431; database=gamefoundry_dev`.

## Local Postgres Non-TLS DDL Evidence
- PASS: DDL apply selected `plain TCP (sslmode=disable)` from `GAMEFOUNDRY_DATABASE_URL`.
- PASS: Applied 15 grouped GFS DDL files through `GAMEFOUNDRY_DATABASE_URL`.

## Table Validation Evidence
- PASS: `node .\scripts\validate-supabase-dev.mjs`
- PASS: Database connection: `host=192.168.2.5; port=55431; database=gamefoundry_dev`.
- PASS: `users table`.
- PASS: `roles table`.
- PASS: `user_roles table`.

## Validation Lane Report
- PASS: `node --check scripts\apply-supabase-dev-ddl.mjs`.
- PASS: `node --check scripts\validate-local-postgres-runtime.mjs`.
- PASS: `node .\scripts\apply-supabase-dev-ddl.mjs`.
- PASS: `node .\scripts\validate-supabase-dev.mjs`.
- PASS: `npm run dev:local-api`; runtime printed `.env loaded for API runtime (5 key(s) applied)` and configured auth/database connections.
- PASS: `npm run validate:local-postgres-runtime`.
- PASS: Forbidden-marker scan for old env/provider/TLS-only/local-db/mock-db markers in changed scripts.
- PASS: `git diff --check -- scripts\apply-supabase-dev-ddl.mjs scripts\validate-local-postgres-runtime.mjs`.
- SKIP: Full samples smoke; PR scope is DDL apply/local product-data validation only.

## Manual Validation Notes
- Platform banner was saved and read through the API; local `platform_settings` banner rows observed: 3.
- Supabase product-data REST calls observed during validation: 0.
- Game Workspace create/getActiveGame used repository `game-workspace-1`; local game rows observed: 1.
- Validation cleanup restored banner rows and removed PR197 Game Workspace rows.
- Initial local runtime validator run failed on stale hardcoded port `55432`; the validation harness was corrected to accept configured local/private `GAMEFOUNDRY_DATABASE_URL` targets, then rerun PASS.

## Artifact Output
- PASS: Repo-structured ZIP created at `tmp/PR_26167_197-ddl-apply-supports-local-postgres_delta.zip`.

## Changed Files
- `scripts/apply-supabase-dev-ddl.mjs`
- `scripts/validate-local-postgres-runtime.mjs`
- `docs_build/dev/reports/PR_26167_197-ddl-apply-supports-local-postgres.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
