# Branch Validation: PR_26179_OWNER_035-dev-auth-user-key-db-authority

## Status

PASS

## Branch

- Current branch: `PR_26179_OWNER_035-dev-auth-user-key-db-authority`
- Source branch: `main`
- Worktree at report time: modified files only for this PR plus generated report artifacts

## Validation Commands

- PASS `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS `node --check src/dev-runtime/testing/supabase-dev-creator-identity-seed-sync.mjs`
- PASS `node --check dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS `node --check dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`
- PASS `node --check src/dev-runtime/toolbox-api/alfa-tool-services.mjs`
- PASS `node --check dev/scripts/sync-supabase-dev-creator-identities.mjs`
- PASS `node --check dev/tests/dev-runtime/TagsApiService.test.mjs`
- PASS `node --test dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`
- PASS `node --test --test-name-pattern "Supabase sign-in resolves|Supabase sign-in does not" dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS `node --test dev/tests/dev-runtime/TagsApiService.test.mjs`
- PASS `git diff --check`
- PASS `npm run validate:canonical-structure`

## DEV Identity Verification

- PASS `qbytes.dq@gmail.com` exists in Supabase Auth.
- PASS `qbytes.dq@gmail.com` exists in product `users`.
- PASS `users.authProviderUserId` matches Supabase Auth id.
- PASS DEV identity sync ran with password updates disabled.
- PASS `/api/auth/sign-in` resolves qbytes to the database `users.key`.
