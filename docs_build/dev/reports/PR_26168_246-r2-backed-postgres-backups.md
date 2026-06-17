# PR_26168_246-r2-backed-postgres-backups

## Branch Validation

PASS - Current branch is `main`; expected branch is `main`.

Local branches found:

```text
main
```

## Summary

Create Backup now validates the current database connection through Admin Operations, runs server-side `pg_dump --format=custom`, writes the dump only to temporary server-side staging, uploads the final `.dump` to the configured R2 backup prefix, and removes staging after upload. `GAMEFOUNDRY_DB_BACKUP_DIR` is deprecated for final backup storage.

Restore From Backup remains scaffold-only.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Read before implementation and followed BUILD/report/ZIP rules. |
| Hard stop unless current branch is `main` | PASS | `git branch --show-current` returned `main`; local branch list contained `main`. |
| Upload final Create Backup artifacts to R2 instead of permanently storing in `GAMEFOUNDRY_DB_BACKUP_DIR` | PASS | `createPostgresBackup` uploads via configured R2 storage and only reports the R2 key. |
| Validate current DB connection before backup | PASS | `createBackupAction()` still calls `validateBackupDatabaseConnection()` before `createPostgresBackup()`. |
| Run server-side `pg_dump --format=custom` | PASS | Backup service keeps `--format=custom`; Node test asserts the dump command args. |
| Write dump to temporary server-side staging only | PASS | Backup service uses OS temp or `GAMEFOUNDRY_DB_BACKUP_STAGING_DIR`; repo `tmp/` staging is rejected. |
| Upload `.dump` to configured R2 backup prefix | PASS | `createConfiguredBackupStorage()` loads `GAMEFOUNDRY_DB_BACKUP_PREFIX`; configured fake R2 validation captured the PUT. |
| Delete temporary local dump after successful upload | PASS | Node test asserts the staged file and staging directory are removed after PASS. |
| Report PASS/FAIL with R2 key, filename, size, timestamp, and environment | PASS | Success and upload-failure results include backup metadata; Playwright asserts visible R2 key PASS/FAIL behavior. |
| Add safe env placeholders and copy-source guidance | PASS | `.env.example` includes provider, prefix, staging note, and deprecated backup-dir guidance. |
| Use environment-specific prefixes for DEV, IST, UAT, PRD | PASS | `.env.example` and database docs list `/dev/`, `/ist/`, `/uat/`, and `/prd/backups/postgres/`; config validates allowed prefixes. |
| R2 prefixes must not require manual folder creation | PASS | `.env.example` and database docs state prefixes are object-key prefixes created by upload. |
| Treat `GAMEFOUNDRY_DB_BACKUP_DIR` as deprecated final storage | PASS | Code ignores it for final storage and only appends a deprecation note when present. |
| Rename/document local staging as temporary only | PASS | Added `GAMEFOUNDRY_DB_BACKUP_STAGING_DIR` as optional temporary staging override. |
| Do not store backups in repo `tmp/` | PASS | Staging root under repo `tmp/` returns FAIL; no `.dump` files were found. |
| Do not commit backup files | PASS | `rg --files -g '*.dump'` returned no matches. |
| Do not expose DB password, storage keys, or secrets | PASS | DB password stays in `PGPASSWORD`; tests assert command args and UI/report messages do not expose secret fixture values. |
| Restore From Backup remains guarded/scaffold-only | PASS | Restore action remains `SKIP`; docs state no approved safe R2 restore path exists in this PR. |
| Use existing storage provider contract where possible | PASS | Backup uses the existing R2 signed storage module and `putObject` contract, with backup-specific config. |
| Do not add unrelated Project Package, migration, or workspace behavior | PASS | Changes are limited to backup storage, Admin Operations backup diagnostics/tests, env/docs, and required reports. |
| Do not run full samples smoke | PASS | Full samples smoke was skipped; no sample JSON or sample runtime behavior changed. |

## Validation Lane Report

Impacted lane: Admin Operations backup action, Local API backup service, R2 storage provider config, and database backup docs.

Skipped broad lanes: full samples, engine-wide runtime, Project Package, migration, and Project Workspace lanes. They were safe to skip because no sample JSON, engine core, package import/export behavior, migration runner, or Project Workspace runtime files changed.

PASS - Syntax/static checks:

```text
node --check src/dev-runtime/storage/storage-config.mjs
node --check src/dev-runtime/storage/r2-project-asset-storage.mjs
node --check src/dev-runtime/database/postgres-backup-service.mjs
node --check src/dev-runtime/server/local-api-router.mjs
node --check assets/theme-v2/js/admin-operations.js
node --check src/engine/api/admin-operations-api-client.js
node --check tests/dev-runtime/PostgresBackupService.test.mjs
node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs
```

PASS - Targeted Local API backup and R2 upload validation:

```text
node --test tests/dev-runtime/PostgresBackupService.test.mjs
```

Result: 7 passed.

Covered:

- Missing R2 backup storage visible FAIL.
- Missing `pg_dump` visible FAIL.
- Repo `tmp/` staging rejection.
- `pg_dump --format=custom` command construction without DB password in args.
- Successful R2 upload metadata with R2 key, filename, size, timestamp, and environment.
- Temporary staged dump and staging directory cleanup after successful upload.
- R2 upload failure reports key metadata and cleans staging.
- Configured R2 provider path against a fake local R2-compatible server.

PASS - Targeted Admin Operations Playwright / visible PASS/FAIL behavior:

```text
npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs --grep "Admin Operations" --reporter=line
```

Result: 4 passed.

Covered:

- Create Backup visible PASS message includes the R2 key.
- Create Backup visible FAIL message is actionable when backup storage config is missing.
- Restore From Backup remains scaffold-only.
- Admin Operations order, safety table, non-admin block, and DEV-only reseed gating remain intact.

PASS - Static artifact and HTML checks:

```text
rg --files -g '*.dump' -g '!node_modules' -g '!tests/results' -g '!tmp'
rg --pcre2 -n "<script(?![^>]+src=)|<style|\s(onclick|onchange|oninput|onsubmit|onkeydown|onkeyup|onload)=" admin/operations.html
git diff --check
```

Results:

- No `.dump` files found.
- No inline Admin Operations HTML violations found.
- `git diff --check` passed with line-ending warnings only.

PASS/WARN - Playwright V8 coverage report generated:

- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- WARN entries are expected for Node-only Local API/storage modules that browser V8 coverage cannot collect.

## Manual Validation Notes

PASS - The tested R2 path used a local fake R2-compatible server and the real configured storage factory, not real production credentials.

PASS - Successful backup tests verified that temporary local staging is removed after upload.

PASS - No real database password, storage access key, storage secret key, service role key, full database URL, or raw dump content was written to reports or UI messages.

PASS - Actual live backup creation still requires a real `.env`, reachable Postgres database, installed PostgreSQL client tools on the Local API host, and configured R2 credentials.

SKIP - Full samples smoke was not run because this PR only changes Admin Operations backup feedback, Local API backup service/storage behavior, env/docs, and targeted tests.

## Artifacts

PASS - Required reports:

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26168_246-r2-backed-postgres-backups.md`

PASS - Repo-structured delta ZIP:

- `tmp/PR_26168_246-r2-backed-postgres-backups_delta.zip`
