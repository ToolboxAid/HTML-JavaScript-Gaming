# Validation Report: PR_26179_OWNER_035-dev-auth-user-key-db-authority

## Result

PASS

## Targeted Validation

- `node --check src/dev-runtime/server/local-api-router.mjs`: PASS
- `node --check src/dev-runtime/testing/supabase-dev-creator-identity-seed-sync.mjs`: PASS
- `node --check dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`: PASS
- `node --check dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`: PASS
- `node --check src/dev-runtime/toolbox-api/alfa-tool-services.mjs`: PASS
- `node --check dev/scripts/sync-supabase-dev-creator-identities.mjs`: PASS
- `node --check dev/tests/dev-runtime/TagsApiService.test.mjs`: PASS
- `node --test dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`: PASS, 2 tests
- `node --test --test-name-pattern "Supabase sign-in resolves|Supabase sign-in does not" dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`: PASS, 2 tests
- `node --test dev/tests/dev-runtime/TagsApiService.test.mjs`: PASS, 3 tests

## Live DEV Validation

- PASS Initial audit detected Supabase Auth user for `qbytes.dq@gmail.com`.
- PASS Initial audit detected missing/stale product `users` row and halted sign-in retest.
- PASS Approved DEV account DML restored the missing identity rows.
- PASS DEV identity sync completed with `updatePasswords: false`.
- PASS Final audit verified `users.authProviderUserId` equals Supabase Auth id.
- PASS `/api/auth/sign-in` returned HTTP 200 and resolved the session to the database `users.key`.

## Repository Guardrails

- `git diff --check`: PASS
- `npm run validate:canonical-structure`: PASS

## Notes

The targeted tests use a server-side Postgres client fixture to exercise the Local API route without opening a real database connection. Default runtime behavior remains unchanged because the injected client defaults to `null`.
