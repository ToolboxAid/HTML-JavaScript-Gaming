# PR_26171_018-local-api-startup-diagnostics

## Purpose
Improve `npm run dev:local-api` startup diagnostics without changing server startup behavior.

## Implementation
- Replaced the compact `.env loaded for API runtime (...)` line with an `Environment Variables` section.
- Prints one `.env` runtime variable per line, sorted alphabetically.
- Uses `+` for variables applied from `.env` and `-` for variables already set before `.env`.
- Masks values for keys containing `PASSWORD`, `SECRET`, `TOKEN`, `KEY`, `SERVICE_ROLE`, or `JWT`.
- Redacts URL username/password credentials before printing non-masked URL values.
- Added an `All Runtime Ports being used by Service` section covering live site, API server, configured API URL, DB/Postgres, Supabase, and storage ports, with `not configured` for missing optional ports.

## Changed Files
- `scripts/start-local-api-server.mjs`
- `tests/dev-runtime/LocalApiStartupLogging.test.mjs`

## Reports
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_018-local-api-startup-diagnostics-validation-report.md`
- `docs_build/dev/reports/PR_26171_018-local-api-startup-diagnostics-manual-validation-notes.md`

## Delta ZIP
- `tmp/PR_26171_018-local-api-startup-diagnostics_delta.zip`
