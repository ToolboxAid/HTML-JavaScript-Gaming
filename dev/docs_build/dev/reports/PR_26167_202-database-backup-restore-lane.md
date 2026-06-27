# PR_26167_202-database-backup-restore-lane

Status: PASS

## Branch Validation

PASS - Current branch is `main`.

## Change Summary

- Added `docs_build/database/backup-restore-lane.md`.
- Linked the backup/restore lane from `docs_build/database/README.md`.
- Documented backup with `pg_dump` using `GAMEFOUNDRY_DATABASE_URL` from `.env`.
- Documented restore with `pg_restore` using `GAMEFOUNDRY_DATABASE_URL` from `.env`.
- Added an explicit destructive-restore checklist and `RESTORE CONFIRMED` confirmation phrase.

## Requirement Checklist

PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.

PASS - Hard stop branch guard satisfied on `main`.

PASS - Added documented manual backup command path.

PASS - Added documented manual restore command path.

PASS - Backup/restore uses `GAMEFOUNDRY_DATABASE_URL` from `.env`.

PASS - Reports are instructed to avoid database URLs, passwords, service keys, tokens, and dump contents.

PASS - Restore requires explicit checklist completion and confirmation before running the destructive command.

## Validation Lane Report

PASS - Backup command path validated by doc scan:

```text
pg_dump --dbname $databaseUrl --format custom --file $backupPath
```

PASS - Restore command path validated by doc scan:

```text
pg_restore --dbname $databaseUrl --clean --if-exists --single-transaction $backupPath
```

PASS - Restore checklist validation confirmed `RESTORE CONFIRMED` guard is documented.

PASS - `git diff --check -- docs_build\database\README.md docs_build\database\backup-restore-lane.md`

## Manual Validation Notes

- No backup or restore was executed.
- No destructive command was run.
- No secrets were printed or written to reports.
- No full samples smoke run because this PR is database operations documentation only.
