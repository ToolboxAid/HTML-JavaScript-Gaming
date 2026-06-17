# PR_26168_245-postgres-backup-foundation

## Branch Validation
- PASS: Current branch was `main`.
- Expected branch: `main`.
- Local branches found: `main`.

## Summary
- Create Backup now routes through Admin Operations to the Local API and runs a server-side Postgres backup foundation.
- The Local API validates the configured database connection with a lightweight Postgres query before attempting backup.
- Backup execution uses `pg_dump --format=custom` and writes to `GAMEFOUNDRY_DB_BACKUP_DIR` on the server side.
- Backup filenames use `gamefoundry-<environment>-db-<YYJJJ>-<sequence>.dump`.
- Browser backup downloads/storage were removed from Create Backup; the UI shows the Local API PASS/FAIL result only.
- Restore From Backup is guarded scaffold-only and does not apply browser-uploaded backup data.

## Requirement Checklist
- PASS: Hard stop guard passed on `main`.
- PASS: Admin Operations Create Backup button calls the Local API action route.
- PASS: Local API Create Backup validates DB connection before `pg_dump`.
- PASS: Local API backup service runs `pg_dump --format=custom` for backups.
- PASS: Backup filename format implemented as `gamefoundry-<environment>-db-<YYJJJ>-<sequence>.dump`.
- PASS: Backup output is directed to `GAMEFOUNDRY_DB_BACKUP_DIR`; repo `tmp/` backup targets are rejected.
- PASS: `.env.example` includes `GAMEFOUNDRY_DB_BACKUP_DIR=`.
- PASS: `.env.dev`, `.env.ist`, `.env.uat`, and `.env.prd` were updated locally with `GAMEFOUNDRY_DB_BACKUP_DIR=`; they are gitignored and contain private values, so they are not included in review artifacts or ZIP output.
- PASS: No real backup files or `.dump` files were created in the repo.
- PASS: Missing `GAMEFOUNDRY_DB_BACKUP_DIR` returns visible FAIL diagnostics.
- PASS: Missing `pg_dump` returns visible FAIL diagnostics.
- PASS: Successful backup reports PASS with filename, size, and timestamp.
- PASS: DB passwords and secrets are not exposed in UI results, reports, command args, or ZIP artifacts.
- PASS: Restore From Backup remains guarded scaffold-only.
- PASS: Export Project Package still shows visible feedback and fails visibly if package bytes are missing.
- PASS: No inline scripts, inline styles, style blocks, script blocks, or inline event handlers were added.
- PASS: No unrelated import, migration, reseed, or Project Workspace behavior was added.

## Validation Lane Report
- PASS: `node --check src/dev-runtime/database/postgres-backup-service.mjs`
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check assets/theme-v2/js/admin-operations.js`
- PASS: `node --check tests/dev-runtime/PostgresBackupService.test.mjs`
- PASS: `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- PASS: `rg --pcre2 -n "<script(?![^>]+src=)|<style|\s(onclick|onchange|oninput|onsubmit|onkeydown|onkeyup|onload)=" admin/operations.html` returned no matches.
- PASS: `node --test tests/dev-runtime/PostgresBackupService.test.mjs`
  - 5 passed.
  - Covered filename format, missing backup dir, unavailable `pg_dump`, repo `tmp/` rejection, and successful custom-format dump command construction.
- PASS: `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs --grep "Admin Operations" --reporter=line`
  - 4 passed.
  - Covered Create Backup visible PASS/FAIL behavior, Export Project Package visible feedback, no silent no-op behavior, no secret exposure, Admin Operations section order, DEV reseed gating, and non-admin access blocking.
- PASS: Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Manual Validation Notes
- Create Backup success path now reports the server-side `.dump` filename, byte size, timestamp, and current environment.
- Create Backup failure paths are visible and actionable for missing backup directory, disallowed repo `tmp/` target, unavailable `pg_dump`, invalid database config, failed database connection validation, and failed `pg_dump`.
- The service passes the DB password to `pg_dump` through `PGPASSWORD`; it is not included in command arguments or browser-visible results.
- Actual live backup creation requires a real `.env` with `GAMEFOUNDRY_DB_BACKUP_DIR`, a reachable Postgres database, and PostgreSQL client tools installed on the Local API host.

## Full Samples Decision
- SKIP: Full samples smoke was not run because this PR only changes Admin Operations backup feedback, Local API backup service behavior, env placeholders, and targeted tests. No sample JSON or sample runtime surface was touched.
