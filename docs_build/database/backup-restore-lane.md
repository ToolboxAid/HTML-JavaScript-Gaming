# Database Backup And Restore Lane

This lane documents operator-controlled backup and restore for the database configured by `.env`.

Runtime, validation, migration apply, backup, and restore all use:

```text
GAMEFOUNDRY_DATABASE_URL
```

Do not paste database URLs, passwords, service keys, or dump contents into reports.

## Backup Command Path

Use the active `.env` as the source of the database connection. Do not pass deployment-target parameters.

PowerShell operator flow:

```powershell
$databaseUrl = (Get-Content .env |
  Where-Object { $_ -match '^GAMEFOUNDRY_DATABASE_URL=' } |
  Select-Object -First 1) -replace '^GAMEFOUNDRY_DATABASE_URL=', ''

$backupPath = Join-Path (Get-Location) 'backups\gamefoundry-backup.dump'
pg_dump --dbname $databaseUrl --format custom --file $backupPath
```

Validation expectation:

- `.env` exists
- `GAMEFOUNDRY_DATABASE_URL` is present
- `pg_dump` is available on the operator machine
- the backup file is written outside tracked source paths
- reports state only the backup path and success/failure, not the connection string

## Restore Checklist

Restore is destructive. Do not run restore unless every checklist item is complete:

- Confirm the target `.env` is the intended database.
- Run `node .\scripts\validate-runtime-connections.mjs` and record PASS/FAIL.
- Confirm the backup file path and checksum.
- Confirm the application is stopped or in a maintenance window.
- Confirm owner approval.
- Type or record the exact operator confirmation phrase: `RESTORE CONFIRMED`.
- Run restore from the operator machine only.
- Run validation after restore.
- Run drift validation when available.

## Restore Command Path

PowerShell operator flow:

```powershell
$confirmation = Read-Host 'Type RESTORE CONFIRMED to restore the configured database'
if ($confirmation -ne 'RESTORE CONFIRMED') {
  throw 'Restore cancelled because confirmation did not match.'
}

$databaseUrl = (Get-Content .env |
  Where-Object { $_ -match '^GAMEFOUNDRY_DATABASE_URL=' } |
  Select-Object -First 1) -replace '^GAMEFOUNDRY_DATABASE_URL=', ''

$backupPath = Join-Path (Get-Location) 'backups\gamefoundry-backup.dump'
pg_restore --dbname $databaseUrl --clean --if-exists --single-transaction $backupPath
```

Restore reports must include:

- target host, port, and database name only
- backup file path
- backup checksum
- confirmation checklist status
- validation result after restore

Restore reports must not include:

- database passwords
- full database URLs
- Supabase service role keys
- access tokens
- raw dump data
