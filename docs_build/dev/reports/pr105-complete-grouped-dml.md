# PR_26164_105-complete-grouped-dml

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Scope

- PR purpose: complete grouped DEV/review DML artifacts under `docs_build/database/dml/`.
- Runtime behavior: unchanged.
- Browser seed execution: not added.
- Supabase: not introduced.
- DML under `docs/` or `src/`: not introduced.
- Password storage: not added.

## Requirement Checklist

- PASS - Replaced old PR101 no-DML placeholder notes with PR105 DEV/review-only setup notes.
- PASS - Account DML contains executable DEV setup DML for required seeded users.
- PASS - Non-account groups contain justified no-DML notes because non-user authoritative records must be generated through the server/API seed layer.
- PASS - DML files remain grouped by the same product/tool groups as DDL.
- PASS - DML is marked temporary DEV/review only.
- PASS - DEV seed users use static ULIDs for User 1, User 2, User 3, and DavidQ admin.
- PASS - Static ULIDs are limited to those DEV users and required `user_roles` bindings.
- PASS - Role records are not inserted by DML because role keys are non-user data and must be server/API-generated.
- PASS - Account DML resolves user roles by existing role slugs and fails visibly if required role rows are missing.
- PASS - No `authProvider='mock'` records are inserted by DML.
- PASS - No passwords, password hashes, app password tables, or password reset token records are inserted by DML.

## DML Completeness Audit

- `account.sql`: executable DML for required DEV users and required `user_roles` bindings.
- `admin.sql`: justified empty/setup note.
- `asset.sql`: justified empty/setup note.
- `controls.sql`: justified empty/setup note.
- `game-configuration.sql`: justified empty/setup note.
- `game-design.sql`: justified empty/setup note.
- `game-journey.sql`: justified empty/setup note.
- `game-workspace.sql`: justified empty/setup note.
- `objects.sql`: justified empty/setup note.
- `palette.sql`: justified empty/setup note.
- `support-tickets.sql`: justified empty/setup note.
- `tags.sql`: justified empty/setup note.
- `tool-metadata.sql`: justified empty/setup note.
- `tool-planning.sql`: justified empty/setup note.
- `toolbox-votes.sql`: justified empty/setup note.

Every grouped DML file has executable DML or a justified no-DML note and is marked DEV/review-only.

## DEV Static User ULID Exception Audit

Allowed static DEV user ULIDs:

- User 1: `01K2GFSJ0Y0000000000000051`
- User 2: `01K2GFSJ0Y0000000000000052`
- User 3: `01K2GFSJ0Y0000000000000053`
- DavidQ admin: `01K2GFSJ0Y0000000000000054`

Allowed static `user_roles` ULIDs:

- `01K2GFSJ0Y0000000000000082`
- `01K2GFSJ0Y0000000000000083`
- `01K2GFSJ0Y0000000000000084`
- `01K2GFSJ0Y0000000000000085`
- `01K2GFSJ0Y0000000000000086`

Validation script result:

- PASS - Static ULIDs in account DML are limited to required DEV users and user-role bindings.
- PASS - No role, game, asset, object, control, vote, ticket, tool metadata, tool planning, tool state, or guest seed static ULIDs were added by DML.

## Seed User Audit

- PASS - Required seeded users appear in account DML.
- PASS - DavidQ admin is used as the audit owner for account DML rows.
- PASS - `authProvider` uses `dev-static-seed`, not `mock`.
- PASS - No `forge-bot`, setup user, beta user, or guest user is inserted by DML.
- PASS - No passwords are present.

## Search Evidence

- `rg -n "INSERT INTO|UPDATE\s+[A-Za-z_]+\s+SET|DELETE FROM|DO \$\$" docs src -g "*.sql"`: no matches, exit 1; no DML under `docs/` or `src/`.
- DML completeness script: PASS for every grouped SQL file.
- Static ULID script: PASS, only allowed DEV users and `user_roles` appeared.
- `rg -n "role-admin|role-creator|role-user|role-guest|dev-setup-user|forge-bot|system user|beta" docs_build/database/dml -g "*.sql"`: no matches, exit 1.
- `rg -n "authProvider.*mock|passwordHash|password_hash|passwordDigest|password_digest|resetToken|reset_token|passwordReset|password_reset" docs_build/database/dml -g "*.sql"`: only matched the guardrail comment stating no such records are defined.

## Validation

- PASS - `git diff --check`
  - Output included CRLF normalization warnings only.
- PASS - Grouped DML completeness audit.
- PASS - DML location audit.
- PASS - Static DEV user ULID exception audit.
- PASS - Seed user audit.
- PASS - Custom password storage audit.

## Impacted Lanes

- Contract lane: grouped DEV/review DML artifacts.
- Runtime lane: not impacted.
- Playwright impacted: No.

## Skipped Lanes

- Playwright skipped because PR105 changes SQL review artifacts only and does not change runtime/UI behavior.
- Samples skipped because samples are not in PR105 scope.
- Full workspace validation skipped because no runtime code changed in this PR.

## Changed Files

PR105 scoped files:

- `docs_build/database/dml/account.sql`
- `docs_build/database/dml/admin.sql`
- `docs_build/database/dml/asset.sql`
- `docs_build/database/dml/controls.sql`
- `docs_build/database/dml/game-configuration.sql`
- `docs_build/database/dml/game-design.sql`
- `docs_build/database/dml/game-journey.sql`
- `docs_build/database/dml/game-workspace.sql`
- `docs_build/database/dml/objects.sql`
- `docs_build/database/dml/palette.sql`
- `docs_build/database/dml/support-tickets.sql`
- `docs_build/database/dml/tags.sql`
- `docs_build/database/dml/tool-metadata.sql`
- `docs_build/database/dml/tool-planning.sql`
- `docs_build/database/dml/toolbox-votes.sql`
- `docs_build/dev/reports/pr105-complete-grouped-dml.md`

The worktree remains stacked on PR103 and PR104.

## Manual Validation Steps

1. Open `docs_build/database/dml/account.sql`.
2. Confirm only User 1, User 2, User 3, DavidQ admin, and required `user_roles` bindings use static ULIDs.
3. Confirm role rows are not inserted by DML.
4. Confirm account DML fails visibly if `user` or `admin` roles are missing.
5. Confirm non-account group DML files contain justified no-DML notes.

## ZIP

- `tmp/PR_26164_105-complete-grouped-dml_delta.zip`

