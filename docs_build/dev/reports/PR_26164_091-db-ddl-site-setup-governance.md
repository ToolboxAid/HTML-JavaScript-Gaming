# PR_26164_091-db-ddl-site-setup-governance

## Branch Validation

PASS: current branch is `main`.

## Scope Summary

PASS: Scoped to database artifact placement, Admin Site Setup planning content, and required reports.

Changed implementation/planning files:

- `admin/site-settings.html`
- `docs_build/database/README.md`
- `docs_build/database/ddl/dev-app-identity-schema.sql`
- `docs_build/database/dml/dev-app-identity-temporary-setup-review.sql`

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution | PASS | Project instructions were read before implementation. |
| Verify current branch is `main` before changes | PASS | `git branch --show-current` returned `main`. |
| Scope to database artifact placement and Admin Site Setup planning only | PASS | Only database review artifacts, Site Settings planning copy, and reports changed. |
| Do not apply `PR_26163_085` as-is | PASS | Auth pages, auth client wiring, script files, runtime API changes, and Playwright auth tests from the prior setup pass were removed from the working tree before this PR work. |
| Move DEV database DDL ownership to `docs_build/database/ddl/` | PASS | `docs_build/database/ddl/dev-app-identity-schema.sql` owns DEV identity table DDL. |
| Move DEV database DML/setup planning to `docs_build/database/dml/` only as temporary review artifacts | PASS | `docs_build/database/dml/dev-app-identity-temporary-setup-review.sql` is marked `TEMPORARY SETUP/REVIEW ARTIFACT`. |
| Do not place DDL under `src/` or `docs/` | PASS | Validation found no `.sql` or `.ddl` files under `src/` or `docs/`. |
| Document Codex DEV DB execution boundary | PASS | `docs_build/database/README.md` and the DML header state Codex may execute DEV database setup only. |
| Document UAT/PROD SQL execution is user-controlled | PASS | `docs_build/database/README.md`, DML header, and Site Settings planning copy state UAT/production SQL execution is user-controlled. |
| Document long-term seed behavior belongs in Admin -> Site Setup | PASS | `docs_build/database/README.md`, DML header, and Admin Site Settings planning content document this ownership. |
| Add/update Admin Site Setup planning content if an existing admin setup page exists | PASS | Updated existing `admin/site-settings.html` with Site Setup and Database Setup planning cards. |
| Do not introduce Supabase runtime wiring | PASS | Changed implementation/planning files contain no Supabase references and no runtime JS changes were made. |
| Do not reintroduce MEM DB | PASS | Changed implementation/planning files contain no MEM DB references. |
| Do not add custom password tables | PASS | DDL contains `users`, `roles`, and `user_roles` only; no password/hash/salt table or column was added. |

## DDL/DML Location Audit

PASS: DDL statements were found only in `docs_build/database/ddl/dev-app-identity-schema.sql`.

DDL evidence:

- `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- `CREATE TABLE IF NOT EXISTS users`
- `CREATE TABLE IF NOT EXISTS roles`
- `CREATE TABLE IF NOT EXISTS user_roles`

PASS: No `.sql` or `.ddl` files exist under `src/` or `docs/`.

PASS: The DML/setup file is under `docs_build/database/dml/` and is clearly marked as a temporary setup/review artifact.

## MEM DB Reintroduction Audit

PASS: Scoped implementation/planning files were scanned for MEM DB terminology and did not introduce MEM DB, Local Mem, or MockDbAdapter references.

Scope scanned:

- `admin/site-settings.html`
- `docs_build/database/README.md`
- `docs_build/database/ddl/dev-app-identity-schema.sql`
- `docs_build/database/dml/dev-app-identity-temporary-setup-review.sql`

## Validation Lane Report

Playwright impacted: No.

No Playwright impact. This PR is documentation/database artifact organization and Admin planning copy only.

Validation commands:

- PASS: `git diff --check`
- PASS: changed-file MEM DB reference audit
- PASS: DDL statement location audit
- PASS: no `.sql` or `.ddl` files under `src/` or `docs/`
- PASS: DML temporary setup/review artifact marker audit
- PASS: no Supabase runtime wiring or custom password-table audit
- PASS: changed HTML inline script/style/event-handler audit

## Manual Validation Notes

- Confirmed the existing Admin Site Settings page now includes Site Setup and Database Setup planning cards.
- Confirmed no inline style attributes, `<style>` blocks, inline script blocks, or inline event handlers were added.
- Confirmed this PR does not add runtime JavaScript, Supabase configuration, auth pages, PowerShell database scripts, or Playwright tests.
- Full samples smoke test was not run because the PR is docs/database artifact organization only.
