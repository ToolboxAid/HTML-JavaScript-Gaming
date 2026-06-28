# PR_26179_OWNER_035-dev-auth-user-key-db-authority

## Summary

This PR makes DEV account session resolution treat the database `users` row as authoritative.

Runtime sign-in now resolves a session only when the Supabase Auth user id matches `users.authProviderUserId`. Matching by email alone is no longer accepted for login/session resolution. Email remains valid only for the DEV identity sync step that locates the existing database `users` row before writing the real Supabase Auth id back to `users.authProviderUserId`.

## Diagnostic Findings

### Where `users.key` currently comes from

- DEV seed setup defines static user keys in `src/dev-runtime/seed/seed-db-keys.mjs`.
- Current database seed DML also contains DEV account rows under `dev/build/database/dml/account.sql`.
- Before this PR, `src/dev-runtime/testing/supabase-dev-creator-identity-seed-sync.mjs` imported those seed keys and used them as the canonical keys during DEV Supabase identity sync.
- After this PR, DEV sync locates existing `users` rows by email and reads `users.key` from the database row. The sync no longer imports `SEED_DB_KEYS`.

### Where `authProviderUserId` is populated

- Account creation provisioning still writes `authProviderUserId` in `src/dev-runtime/server/local-api-router.mjs` through `provisionSupabaseIdentityForAuthPayload()`.
- DEV identity sync now reads `auth.users.id` from Supabase Auth, reads `users.key` from the database row found by email, and sends that database-owned key plus the real Auth id through `databaseProvider.initializeIdentity()`.

### Seed constant use

- Seed constants remain valid for DEV seed setup, seed fixtures, and existing test/demo data.
- They are no longer used by the DEV identity sync helper as the authoritative app user key source.
- Runtime sign-in/session resolution does not hardcode DavidQ or other user keys. It reads identity tables and resolves `matchingUser.key` after matching Supabase Auth id to `users.authProviderUserId`.

## Exact Fix

- Removed email fallback from Supabase sign-in session resolution.
- Added a Creator-safe setup failure when Auth succeeds but the matching email row has not been linked to the Auth id.
- Added a narrow server-side Postgres client injection hook for tests, with default runtime behavior unchanged.
- Refactored DEV creator identity sync so canonical identity definitions are email-based and database `users.key` is read from existing rows.
- Changed role assignment and cleanup repair logic to derive canonical user keys from database rows.
- Added regression tests proving:
  - Sign-in uses the database-owned `users.key` matched by `authProviderUserId`.
  - Sign-in does not create a session from matching email when `authProviderUserId` is stale.
  - DEV sync preserves non-seed database user keys.
  - DEV sync fails if an expected database `users` row is missing.

## Files Changed

- `src/dev-runtime/server/local-api-router.mjs`
- `src/dev-runtime/testing/supabase-dev-creator-identity-seed-sync.mjs`
- `dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`

## Validation

PASS:

- `node --check src/dev-runtime/server/local-api-router.mjs`
- `node --check src/dev-runtime/testing/supabase-dev-creator-identity-seed-sync.mjs`
- `node --check dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `node --check dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`
- `node --test dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`
- `node --test --test-name-pattern "Supabase sign-in resolves|Supabase sign-in does not" dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `git diff --check`
- `npm run validate:canonical-structure`

