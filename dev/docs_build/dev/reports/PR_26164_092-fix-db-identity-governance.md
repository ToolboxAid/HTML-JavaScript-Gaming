# PR_26164_092-fix-db-identity-governance

## Branch Validation

PASS: current branch is `main`.

## Scope Summary

PASS: Scoped to fixing the DB DDL/DML governance issues from PR_26164_091 only.

Changed files:

- `docs_build/database/README.md`
- `docs_build/database/ddl/dev-app-identity-schema.sql`
- `docs_build/database/dml/dev-app-identity-temporary-setup-review.sql`

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution | PASS | Project instructions were read before implementation. |
| Verify current branch is `main` before changes | PASS | `git branch --show-current` returned `main`. |
| Scope to DB DDL/DML governance issues from PR_26164_091 only | PASS | Only database governance docs, DDL, DML, and reports changed. |
| Use project governance model | PASS | DDL now uses key-based identity records and shared audit ownership fields. |
| Do not use legacy id ownership model | PASS | SQL audit found no legacy id-based identity ownership patterns in DDL/DML. |
| Use key-based records | PASS | `users`, `roles`, and `user_roles` each define `key text PRIMARY KEY`. |
| Audit fields exist on shared records | PASS | `createdAt`, `updatedAt`, `createdBy`, and `updatedBy` exist on all three identity tables. |
| Ownership fields reference `users.key` | PASS | `createdBy` and `updatedBy` reference `users(key)`; `user_roles.userKey` references `users(key)`. |
| Keep DDL under `docs_build/database/ddl/` | PASS | Identity DDL remains in `docs_build/database/ddl/dev-app-identity-schema.sql`. |
| Keep temporary DML/setup under `docs_build/database/dml/` | PASS | Temporary setup SQL remains in `docs_build/database/dml/dev-app-identity-temporary-setup-review.sql`. |
| Do not place DDL under `src/` or `docs/` | PASS | Validation found no `.sql` or `.ddl` files under `src/` or `docs/`. |
| Do not reintroduce MEM DB | PASS | Database governance files contain no MEM DB references. |
| Do not introduce Supabase runtime wiring | PASS | No runtime files changed; database governance files contain no Supabase references. |
| Do not add custom password storage tables | PASS | No password storage tables or password hash/salt fields were added. |
| Do not add fake login behavior | PASS | No runtime/auth files changed; the temporary DML setup user is inactive and has no auth provider. |
| Seed roles by role key | PASS | Temporary DML uses role keys such as `role-admin`, `role-creator`, `role-user`, and `role-guest`. |
| Seed user_roles by userKey and roleKey | PASS | Temporary DML inserts `user_roles` with `userKey` and `roleKey`. |
| Mark temporary DML as review/dev setup only | PASS | DML header states it is a temporary setup/review artifact and DEV review only until Admin -> Site Setup owns setup behavior. |

## Identity Schema Governance Audit

PASS: `users` uses:

- `key text PRIMARY KEY`
- `createdAt`
- `updatedAt`
- `createdBy` referencing `users(key)`
- `updatedBy` referencing `users(key)`

PASS: `roles` uses:

- `key text PRIMARY KEY`
- `createdAt`
- `updatedAt`
- `createdBy` referencing `users(key)`
- `updatedBy` referencing `users(key)`

PASS: `user_roles` uses:

- `key text PRIMARY KEY`
- `userKey` referencing `users(key)`
- `roleKey` referencing `roles(key)`
- `createdAt`
- `updatedAt`
- `createdBy` referencing `users(key)`
- `updatedBy` referencing `users(key)`

PASS: Legacy identity ownership patterns are absent from the DDL/DML files.

## DDL/DML Location Audit

PASS: DDL is only under `docs_build/database/ddl/`.

PASS: Temporary DML/setup SQL is only under `docs_build/database/dml/`.

PASS: No `.sql` or `.ddl` files exist under `src/` or `docs/`.

## MEM DB Reintroduction Audit

PASS: Scoped database governance files were scanned and do not contain MEM DB, Local Mem, or MockDbAdapter references.

## Validation Lane Report

Playwright impacted: No.

No Playwright impact. This PR is a DDL/DML governance fix only.

Validation commands:

- PASS: `git diff --check`
- PASS: no DDL files under `src/` or `docs/`
- PASS: identity DDL key-primary audit
- PASS: identity DDL audit-field audit
- PASS: ownership fields reference `users.key`
- PASS: no legacy id-based identity ownership patterns remain in DDL/DML
- PASS: no MEM DB references in database governance files
- PASS: no Supabase runtime wiring or password storage table references
- PASS: temporary DML review/dev setup marker and key-reference audit

## Manual Validation Notes

- Confirmed the DDL no longer defines generated numeric or UUID identity ownership columns.
- Confirmed the temporary setup SQL uses role keys and joins by `userKey` / `roleKey`.
- Confirmed no runtime JavaScript, auth client, account page, fake login behavior, or Playwright test changes were made.
- Full samples smoke test was not run because this PR is DDL/DML governance only.
