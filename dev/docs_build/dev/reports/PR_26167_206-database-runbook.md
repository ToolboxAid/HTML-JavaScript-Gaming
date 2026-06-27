# PR_26167_206-database-runbook

Status: PASS

## Branch Validation

PASS - current branch is `main`.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Re-read before PR206 edits. |
| Add DB runbook for validate | PASS | `docs_build/database/runbook.md` documents `validate-runtime-connections.mjs` and `validate-database-drift.mjs`. |
| Add DB runbook for apply DDL | PASS | Runbook documents `node .\scripts\apply-database-ddl.mjs`. |
| Add DB runbook for apply DML | PASS | Runbook documents `node .\scripts\apply-database-dml.mjs`. |
| Add DB runbook for seed DEV | PASS | Runbook documents dry-run and live DEV seed commands, with User 1-3 creator-only and DavidQ owner/admin/creator notes. |
| Add DB runbook for backup | PASS | Runbook links to backup lane and lists backup checklist. |
| Add DB runbook for restore | PASS | Runbook links to restore lane and requires `RESTORE CONFIRMED`. |
| Add DB runbook for promote DEV -> IST -> UAT -> PRD | PASS | Runbook documents the ordered manual copy-source promotion flow. |
| Add rollback guidance | PASS | Runbook documents forward-fix preference and restore-based rollback steps. |
| Document `schema_migrations` as authoritative migration state | PASS | Runbook State Authority and apply sections identify `schema_migrations` as DDL/DML state. |
| Document `platform_settings` as runtime settings only | PASS | Runbook states `platform_settings` must not track, gate, or control migration apply state. |
| Docs/static validation | PASS | `npm run test:playwright:static` passed. |
| `git diff --check` | PASS | Final full `git diff --check` passed after PR206 review artifacts were regenerated. |

## Validation Lane Report

Commands run:

- `rg -n "validate-runtime-connections|apply-database-ddl|apply-database-dml|apply-database-seed|pg_dump|RESTORE CONFIRMED|DEV -> IST -> UAT -> PRD|schema_migrations|platform_settings|Rollback" docs_build\database\runbook.md docs_build\database\README.md` - PASS
- `git diff --check -- docs_build\database\README.md docs_build\database\runbook.md` - PASS
- `npm run test:playwright:static` - PASS
- `git diff --check` - PASS

Skipped lanes:

- Runtime validation - SKIP, docs/runbook-only PR.
- Playwright browser validation - SKIP, no runtime UI behavior changed by PR206.
- Full samples smoke - SKIP, samples are not in scope.

## Manual Validation Notes

The runbook was manually reviewed against the requested operator topics: validate, apply DDL, apply DML, seed DEV, backup, restore, promotion, and rollback. It keeps `.env` as the active runtime/apply source, identifies copy-source target files as manual inputs only, uses `schema_migrations` as migration state, and keeps `platform_settings` limited to runtime settings.
