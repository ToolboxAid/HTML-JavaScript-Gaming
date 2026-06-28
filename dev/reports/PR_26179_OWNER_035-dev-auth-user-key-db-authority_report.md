# PR_26179_OWNER_035-dev-auth-user-key-db-authority

## Summary

This PR makes DEV account session resolution treat the database `users` row as authoritative.

Runtime sign-in now resolves a session only when the Supabase Auth user id matches `users.authProviderUserId`. Matching by email alone is not accepted for login/session resolution. Email remains valid only for the approved DEV identity sync step that locates the existing database `users` row before writing the real Supabase Auth id back to `users.authProviderUserId`.

## Branch Status

- Source branch: `PR_26179_OWNER_035-dev-auth-user-key-db-authority`
- Base branch: `main`
- Rebased onto main HEAD: `13cbe98955c1bcc014bff07480b7d3399386e72f`
- Main still excludes this fix until PR merge: yes

## Diagnostic Findings

### Where `users.key` comes from

- DEV seed setup still defines static fixture keys in `src/dev-runtime/seed/seed-db-keys.mjs` for seed/bootstrap data.
- Before this PR, DEV Supabase identity sync used those seed constants as the authoritative app user keys.
- After this PR, DEV sync locates existing database `users` rows by email and reads `users.key` from the database row. Missing or duplicate database rows are explicit setup errors.

### Where `authProviderUserId` is populated

- Account provisioning continues to write `authProviderUserId` in `src/dev-runtime/server/local-api-router.mjs` through the API/server path.
- DEV identity sync reads Supabase Auth `auth.users.id`, reads the existing product `users.key` from the database row found by email, then writes the real Auth id to `users.authProviderUserId`.

### Runtime resolution

- Supabase sign-in/session resolution now requires an active product `users` row whose `authProviderUserId` equals the Supabase Auth user id.
- If Auth succeeds but the product row is not linked, the API returns a controlled setup message directing the operator to run the approved DEV identity sync.
- Runtime login no longer hardcodes DavidQ/user keys and no longer uses display name as an identity key.

## Exact Fix

- Removed email fallback from Supabase sign-in session resolution.
- Added a Creator-safe setup failure when Auth succeeds but the matching email row has not been linked to the Auth id.
- Added a narrow server-side Postgres client injection hook for tests, with default runtime behavior unchanged.
- Refactored DEV creator identity sync so canonical identity definitions are email-based and database `users.key` is read from existing rows.
- Changed role assignment and cleanup repair logic to derive canonical user keys from database rows.
- Removed the Alfa toolbox tag/design/configuration helper behavior that upserted seed `users` rows over DEV account keys.
- Changed the DEV identity sync default so existing Supabase Auth users are updated without sending a password. Password updates now require explicit `--update-passwords`.
- Added regression tests for auth id matching, stale authProviderUserId handling, existing database key preservation, missing database rows, Tags API seeding not modifying `users`, and password-safe sync defaults.

## Current DEV Data Note

Read-only verification before packaging found:

- `qbytes.dq@gmail.com` exists in Supabase Auth.
- `qbytes.dq@gmail.com` is currently missing from the product `users` table.
- Therefore `users.authProviderUserId` is not synced for that account yet.

The mutating DEV identity sync was not run during this package/push step. Next action after this PR is merged: run the approved DEV identity sync against the current DEV database, then re-test sign-in.

## Files Changed

- `src/dev-runtime/server/local-api-router.mjs` - updated
- `src/dev-runtime/testing/supabase-dev-creator-identity-seed-sync.mjs` - updated
- `src/dev-runtime/toolbox-api/alfa-tool-services.mjs` - updated
- `dev/scripts/sync-supabase-dev-creator-identities.mjs` - updated
- `dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs` - updated
- `dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs` - updated
- `dev/tests/dev-runtime/TagsApiService.test.mjs` - updated

## Validation

PASS:

- `git diff --check`
- `npm run validate:canonical-structure`
- `node --check src/dev-runtime/server/local-api-router.mjs`
- `node --check src/dev-runtime/testing/supabase-dev-creator-identity-seed-sync.mjs`
- `node --check src/dev-runtime/toolbox-api/alfa-tool-services.mjs`
- `node --check dev/scripts/sync-supabase-dev-creator-identities.mjs`
- `node --check dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `node --check dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`
- `node --check dev/tests/dev-runtime/TagsApiService.test.mjs`
- `node --test dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`
- `node --test --test-name-pattern "Supabase sign-in resolves|Supabase sign-in does not" dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `node --test dev/tests/dev-runtime/TagsApiService.test.mjs`
