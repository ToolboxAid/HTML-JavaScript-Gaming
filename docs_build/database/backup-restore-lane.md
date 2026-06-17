# Database Backup And Restore Lane

This lane documents operator-controlled backup and restore for the database configured by `.env`.

Runtime, validation, migration apply, backup, and restore all use:

```text
GAMEFOUNDRY_DATABASE_URL
```

Do not paste database URLs, passwords, service keys, or dump contents into reports.

## Backup Operation Path

Use the active `.env` as the source of the database connection and R2 backup
storage configuration. Do not pass deployment-target parameters.

Required backup storage variables:

```text
GAMEFOUNDRY_DB_BACKUP_STORAGE_PROVIDER=r2
GAMEFOUNDRY_DB_BACKUP_PREFIX=/dev/backups/postgres/
```

Copy-source target files must use the matching prefix:

- DEV: `/dev/backups/postgres/`
- IST: `/ist/backups/postgres/`
- UAT: `/uat/backups/postgres/`
- PRD: `/prd/backups/postgres/`

R2 prefixes are object-key prefixes. They are created by upload and do not
require manual folder creation.

Create Backup runs through Admin Operations and the Local API:

1. Validate the current database connection.
2. Run server-side `pg_dump --format=custom`.
3. Write the `.dump` only to temporary server-side staging.
4. Upload the `.dump` to the configured R2 backup prefix.
5. Delete the temporary local dump after upload.
6. Report PASS/FAIL without exposing database passwords or storage secrets.

`GAMEFOUNDRY_DB_BACKUP_DIR` is deprecated for final backup storage. If
temporary staging must be overridden, use
`GAMEFOUNDRY_DB_BACKUP_STAGING_DIR` and keep it outside repo `tmp/`.

Validation expectation:

- `.env` exists
- `GAMEFOUNDRY_DATABASE_URL` is present
- `GAMEFOUNDRY_DB_BACKUP_STORAGE_PROVIDER` is `r2`
- `GAMEFOUNDRY_DB_BACKUP_PREFIX` matches the active target prefix
- R2 endpoint, bucket, access key, and secret key are configured server-side
- `pg_dump` is available on the Local API host
- the local dump is temporary staging only and is deleted after upload
- reports state only R2 key, filename, size, timestamp, environment, and
  success/failure, not the connection string or storage secrets

Backup metadata must be recorded without secrets:

- `backupName`
- `databaseName`
- `createdAt`
- `migrationVersion`
- `environment`
- `fileName`
- `r2Key`
- `sizeBytes`

Use `schema_migrations` to derive `migrationVersion`; do not use
`platform_settings` for backup migration state.

## Restore Checklist

Restore is destructive. Admin Operations Restore From Backup remains
scaffold-only until a later PR explicitly implements safe R2 restore. Do not
run restore unless every checklist item is complete:

- Confirm the target `.env` is the intended database.
- Run `node .\scripts\validate-runtime-connections.mjs` and record PASS/FAIL.
- Validate the current `schema_migrations` state before applying restore.
- Confirm the R2 backup key, filename, size, timestamp, and checksum.
- Confirm the backup metadata `migrationVersion`.
- Confirm the application is stopped or in a maintenance window.
- Confirm owner approval.
- Type or record the exact operator confirmation phrase: `RESTORE CONFIRMED`.
- Run restore from the operator machine only.
- Run validation after restore.
- Run drift validation when available.

## Restore Command Path

No active Restore From Backup command path is approved in this PR. Safe R2
restore must be explicitly implemented and reviewed before `pg_restore` is
available through Admin Operations.

Restore reports must include:

- target host, port, and database name only
- backup metadata: `backupName`, `databaseName`, `createdAt`, and `migrationVersion`
- R2 backup key and filename
- backup checksum
- migration state validation before restore
- confirmation checklist status
- validation result after restore

Restore reports must not include:

- database passwords
- full database URLs
- Supabase service role keys
- access tokens
- raw dump data
