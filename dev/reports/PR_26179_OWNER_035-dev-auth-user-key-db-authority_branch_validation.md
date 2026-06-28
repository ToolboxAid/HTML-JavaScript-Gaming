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
- PASS `node --test dev/tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`
- PASS `node --test --test-name-pattern "Supabase sign-in resolves|Supabase sign-in does not" dev/tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS `git diff --check`
- PASS `npm run validate:canonical-structure`

