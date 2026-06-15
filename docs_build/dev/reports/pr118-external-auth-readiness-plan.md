# PR_26164_118 External Auth Readiness Plan

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.
- Worktree before changes: clean.

## Scope

- PASS: Planning/report-only PR.
- PASS: No runtime files changed.
- PASS: No external auth implementation added.
- PASS: No runtime auth dependency added.
- PASS: No production auth behavior changed.
- PASS: No custom password table added.
- PASS: No app-table password storage planned or added.
- PASS: No retired in-memory database/auth route names or legacy login route were added.
- PASS: No roadmap status update was made because there was no execution-backed status-marker transition.

## Source Reports Reviewed

- WARN: `docs_build/dev/reports/local-db-migration-closeout.md` was requested but is not present at that path.
- PASS: `docs_build/dev/reports/db-consumer-audit-final.md` reviewed.
- PASS: `docs_build/dev/reports/db-consumer-audit-final-2.md` reviewed.

Source summary:

- The final audit reports classify active app/tool/Admin data consumers as migrated to the Local DB route or explicitly out of scope.
- Active Account/Admin identity surfaces render through Local DB/server API page data.
- Active Toolbox data surfaces use server API clients and Local DB-backed dev-runtime repositories.
- Remaining findings are engine boundary follow-ups, compatibility shims, or non-product config/reference sources.
- Static DEV user identifiers remain the only documented static key exception.

## Auth Readiness Position

Current Local DB behavior remains the DEV bridge until a later PR explicitly introduces external-auth DEV behavior.

Recommended target:

- Auth provider: Supabase Auth.
- Database provider: Supabase Postgres.

This PR does not add Supabase runtime wiring. It defines the migration contract and promotion sequence only.

## Environment Ownership

DEV:

- Codex may run Local DB setup and migration only.
- Local DB remains the active DEV bridge until Supabase DEV is explicitly introduced.
- Local PowerShell sign-in/setup scripts may use static DEV ULIDs only for `User 1`, `User 2`, `User 3`, and `DavidQ`.
- DEV setup must remain visibly diagnostic when required config is missing.

UAT:

- User runs reviewed SQL/setup.
- Codex may prepare reviewed SQL, checklists, and validation plans, but does not execute UAT SQL.
- UAT must use external auth and reviewed database setup before promotion is claimed.

PROD:

- User runs reviewed SQL/setup.
- Codex may prepare reviewed SQL, checklists, and validation plans, but does not execute PROD SQL.
- PROD must not depend on Local DB bridge behavior, static DEV users, browser-owned user keys, or app-owned passwords.

## Placeholder Account Flows

- Create Account remains a production-safe placeholder until external auth exists.
- Lost Password remains a production-safe placeholder until external auth exists.
- Placeholders must not create app password records.
- Placeholders must not imply that app-owned password reset is active.
- When Supabase Auth is introduced, these pages should call the provider adapter instead of adding page-local auth behavior.

## Admin Site Setup Ownership

Admin -> Site Setup owns long-term setup and seed behavior.

Rules:

- Permanent setup behavior belongs in Admin -> Site Setup runtime flows.
- Temporary DEV setup scripts are allowed only as local bridge tools.
- UAT/PROD setup must be reviewed and user-run.
- Seed behavior must not become a hidden runtime default.
- Setup failures must be visible, actionable, and logged.

## Identity and Key Rules

App identity:

- `users.key` remains the app-owned identity key.
- External provider user ids map to `users.key`; they do not replace it directly in product records.
- `roles.key` and `user_roles.userKey` / `user_roles.roleKey` remain key-based.
- Audit fields continue to reference `users.key`.

DEV-only exception:

- Static DEV ULIDs may be used only for `User 1`, `User 2`, `User 3`, and `DavidQ`.
- The exception exists only to support local PowerShell sign-in/setup scripts.
- Static DEV user keys must not be used as a pattern for product records.

Non-user records:

- All non-user records must use server/API-generated real ULIDs.
- Browser pages must not author authoritative product keys.
- Browser pages must not own authoritative user keys.

Password rules:

- Do not add custom password tables.
- Do not store passwords, password hashes, reset secrets, or verification secrets in app tables.
- Password reset and verification belong to the external auth provider.

## Future Auth Provider Contract

The external auth provider adapter must expose or support:

- `getCurrentUser`
- `signIn`
- `signOut`
- `requireRole` or equivalent role gate
- Mapping from external auth user to `users.key`
- Creation or lookup of the app `users` row after provider authentication
- Visible actionable errors for missing provider config
- Explicit unauthenticated, unauthorized, and expired-session states

The provider adapter must prohibit:

- Browser-owned authoritative user keys.
- App-owned password storage.
- Silent fallback to Local DB when external auth is required.
- Hidden default users.
- Environment config drift between DEV, UAT, and PROD.

## Supabase Migration Sequence

1. Supabase project/environment setup checklist

   Deliverables:

   - Document required Supabase project settings.
   - Document required environment variables without storing secrets in the repo.
   - Document callback/redirect URLs for DEV, UAT, and PROD.
   - Document provider email/password settings and any future OAuth providers separately.
   - Document RLS policy review requirements.

   Validation gates:

   - Missing config fails visibly.
   - No repo hardcoded secrets.
   - Create Account and Lost Password remain placeholders until the adapter PR.

2. Supabase DEV auth provider adapter

   Deliverables:

   - Introduce a DEV-only external-auth adapter behind the auth provider contract.
   - Implement `getCurrentUser`, `signIn`, `signOut`, and role-gate behavior.
   - Map authenticated Supabase users to app `users.key`.
   - Bootstrap or find the app user row after successful auth.

   Validation gates:

   - DEV can sign in through Supabase Auth.
   - Sign out clears active user state.
   - Missing Supabase DEV config fails visibly.
   - Local DB bridge remains available only if this PR explicitly keeps it as a selectable DEV mode.

3. Supabase DEV Postgres adapter

   Deliverables:

   - Add Supabase Postgres adapter behind existing server/API data contracts.
   - Keep `users`, `roles`, and `user_roles` key-based.
   - Keep audit ownership fields referencing `users.key`.
   - Preserve Local DB until explicit DEV cutover validation passes.

   Validation gates:

   - Active Account/Admin/Toolbox consumers read and write through server/API contracts.
   - Non-user records use server/API-generated real ULIDs.
   - No browser storage becomes product-data source of truth.
   - No silent fallback to Local DB when Supabase DEV mode is selected.

4. Admin Site Setup runtime for Supabase DEV

   Deliverables:

   - Move setup/seed behavior into Admin -> Site Setup flows.
   - Support reviewed DEV setup actions with visible per-step status.
   - Keep UAT/PROD execution user-controlled.

   Validation gates:

   - Setup idempotency is visible.
   - Setup failures identify the failed table/action.
   - Seed behavior is user-triggered, not hidden.
   - Static DEV user exceptions remain limited to the named local script users.

5. UAT promotion checklist

   Deliverables:

   - Reviewed UAT SQL/setup package.
   - UAT environment variable checklist.
   - UAT auth callback/redirect checklist.
   - UAT RLS and role-gate validation checklist.
   - UAT data migration/reconciliation checklist.

   Validation gates:

   - User confirms UAT SQL/setup execution.
   - UAT sign in, sign out, role gates, user bootstrap, and password reset provider flow pass.
   - UAT has no Local DB bridge dependency.
   - UAT has no app-owned password storage.

6. PROD promotion checklist

   Deliverables:

   - Reviewed PROD SQL/setup package.
   - PROD environment variable checklist.
   - PROD auth callback/redirect checklist.
   - PROD RLS and role-gate validation checklist.
   - Rollback and incident-response notes.

   Validation gates:

   - User confirms PROD SQL/setup execution.
   - PROD sign in, sign out, role gates, user bootstrap, and password reset provider flow pass.
   - PROD has no Local DB bridge dependency.
   - PROD has no app-owned password storage.
   - Admin -> Site Setup owns ongoing setup/seed operations.

## Migration Risks and Controls

Risk: Auth user and app user drift.

- Control: Store provider identity mapping explicitly and resolve every session to `users.key`.

Risk: Hidden fallback to DEV bridge.

- Control: Environment mode must select one provider route. Missing external config fails visibly.

Risk: UAT/PROD SQL execution ambiguity.

- Control: Codex prepares reviewed SQL/checklists only. User performs UAT/PROD execution.

Risk: Password ownership accidentally moves into app tables.

- Control: Provider owns passwords, resets, and verification. App tables store only app profile/role data.

Risk: Static DEV keys spread into product records.

- Control: Static DEV ULIDs are limited to named local sign-in users; all non-user records use server/API-generated real ULIDs.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified current branch is `main` before changes.
- PASS: Started from available latest Local DB closeout/audit reports.
- WARN: Requested `local-db-migration-closeout.md` was not present at the requested path.
- PASS: Scoped this PR to external auth/Supabase readiness planning only.
- PASS: Did not implement Supabase.
- PASS: Did not add runtime Supabase dependencies.
- PASS: Did not change production auth behavior.
- PASS: Did not add custom password tables.
- PASS: Did not store passwords in app tables.
- PASS: Did not add retired auth/database route references.
- PASS: Created a concrete migration plan for replacing Local DEV auth/session selection with external auth.
- PASS: Recommended Supabase Auth and Supabase Postgres.
- PASS: Documented DEV/UAT/PROD ownership.
- PASS: Documented Local DB as the DEV bridge until Supabase DEV is explicitly introduced.
- PASS: Documented Create Account and Lost Password as production-safe placeholders.
- PASS: Documented Admin -> Site Setup setup/seed ownership.
- PASS: Documented static DEV ULID limits for `User 1`, `User 2`, `User 3`, and `DavidQ`.
- PASS: Documented server/API-generated real ULID requirement for all non-user records.
- PASS: Documented future auth provider contract requirements.
- PASS: Documented Supabase migration sequence.
- PASS: Playwright impacted: No.

## Manual Validation Notes

- `git diff --check`: PASS.
- Runtime files changed: PASS, none.
- Supabase dependency added: PASS, no dependency/package files changed.
- Custom password table added: PASS, no DDL/DML/runtime files changed.
- Retired auth/database names or legacy login route introduced: PASS, no matching additions in the final diff.
- Roadmap update: SKIP, no execution-backed status-marker update.
- Playwright: SKIP, planning/report-only PR.
- Samples smoke test: SKIP, planning/report-only PR with no runtime or samples changes.

## Required Outputs

- PASS: `docs_build/dev/reports/pr118-external-auth-readiness-plan.md`
- PASS: `docs_build/dev/reports/codex_review.diff`
- PASS: `docs_build/dev/reports/codex_changed_files.txt`
- PASS: `tmp/PR_26164_118-external-auth-readiness-plan_delta.zip`
