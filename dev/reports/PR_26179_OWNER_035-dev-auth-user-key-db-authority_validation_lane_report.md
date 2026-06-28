# Validation Lane Report: PR_26179_OWNER_035-dev-auth-user-key-db-authority

## Lane

Targeted auth and DEV identity sync validation.

## Commands

- PASS `node --test dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`
- PASS `node --test --test-name-pattern "Supabase sign-in resolves|Supabase sign-in does not" dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`

## Coverage

- DEV identity sync reads existing database `users.key` values by email.
- DEV identity sync writes real Supabase Auth ids to `users.authProviderUserId`.
- Session resolution accepts only `auth.users.id` matched to `users.authProviderUserId`.
- Email-only session resolution is rejected with the existing Creator-safe setup message.

