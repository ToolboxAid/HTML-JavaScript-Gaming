# PR_26166_165-auth-test-user-cleanup

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` read before execution.

## Scope Summary

PASS

- Added DEV-only Supabase Auth test-account cleanup.
- Cleanup is limited to Supabase-auth users whose email matches `codex-*` or `playwright-*` at `example.test`.
- Cleanup deletes Supabase Auth users, matching `users` rows, and matching `user_roles` rows.
- Added explicit audit-reference reassignment guard for shared account rows that still reference a test user as `createdBy` or `updatedBy`.
- Added reusable cleanup script: `npm run cleanup:supabase-dev-auth-test-users`.
- No UAT or PROD enablement was added.
- No product-data provider cutover was added; product data remains Local DB.
- No password tables were added.
- No browser-owned auth/provider logic was added.
- No silent fallback was added.
- No `.env.local` or secret values were changed or committed.

## Requirement Checklist

- PASS - Treat PR_165 as one separate BUILD unit only.
- PASS - Main branch only; current branch was `main`.
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before work.
- PASS - Add DEV-only auth test user cleanup.
- PASS - Delete Supabase Auth user, `users` row, and `user_roles` rows for matching test accounts only.
- PASS - Add reusable DEV cleanup pattern for later PRs.
- PASS - No UAT/PROD enablement.
- PASS - Do not commit secrets or `.env.local`.
- PASS - Clean up Codex-created test data before packaging.
- PASS - Run `npm run validate:supabase-dev`.
- PASS - Run targeted auth/session validation.
- PASS - Playwright impacted: targeted auth/session Playwright run completed.
- PASS - Do not run full samples smoke.
- PASS - Create `codex_review.diff`, `codex_changed_files.txt`, PR-specific report, validation notes, and cleanup report.

## Validation Lane Report

Executed lanes:

- contract: `node --check` for changed runtime/script/test files.
- contract: `node --test tests/dev-runtime/SupabaseDevAuthTestUserCleanup.test.mjs`
- contract: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- integration/runtime: `npm run validate:supabase-dev`
- targeted Playwright auth/session: `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs --project=playwright --workers=1 --reporter=list`
- cleanup/live DEV: dry-run, delete with explicit audit user, final dry-run confirmation.

Skipped lanes:

- Full samples smoke: SKIP by request and no samples were in scope.
- Admin DB Viewer validation: SKIP for PR_165 because no Admin DB Viewer behavior changed.
- Targeted provider/API validation for migrated product areas: SKIP for PR_165 because no product areas were migrated.
- `npm run test:workspace-v2`: SKIP because no Project Workspace, toolState, or workspace runtime behavior changed. The command name is legacy; user-facing language remains Project Workspace.

## Validation Results

- PASS - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS - `node --check src/dev-runtime/testing/supabase-dev-auth-test-user-cleanup.mjs`
- PASS - `node --check scripts/cleanup-supabase-dev-auth-test-users.mjs`
- PASS - `node --check tests/dev-runtime/SupabaseDevAuthTestUserCleanup.test.mjs`
- PASS - `node --test tests/dev-runtime/SupabaseDevAuthTestUserCleanup.test.mjs` (5 tests passed)
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` (29 tests passed)
- PASS - `npm run validate:supabase-dev` (overall PASS; DEV direct PostgreSQL TLS warning remains advisory: `SELF_SIGNED_CERT_IN_CHAIN`)
- PASS - `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs --project=playwright --workers=1 --reporter=list` (1 test passed)
- PASS - `npm run cleanup:supabase-dev-auth-test-users -- --dry-run --json` after cleanup confirmed zero candidates.

## Manual Validation Notes

- Confirmed live DEV cleanup dry-run found seven matching Supabase-auth test accounts and one shared account audit dependency.
- Confirmed delete mode required an explicit surviving non-test DEV audit user key before reassignment.
- Confirmed delete mode removed seven matching test `users` rows and six matching `user_roles` rows.
- Confirmed one older candidate had an already-missing Supabase Auth account; cleanup reported `authUserNotFound=true` and still removed the matching `users` row after audit reassignment.
- Confirmed the final dry-run returned `testDataCandidates: 0`.
- Confirmed skipped non-test users were not deleted.
- Confirmed targeted Playwright sign-in still resolves Supabase-backed auth/session through the local API with `GAMEFOUNDRY_DB_PROVIDER=local-db`.

## Playwright V8 Coverage

- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Guardrail: `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- Runtime JS changes were server/dev-runtime oriented and were not collected by browser V8 coverage; missing changed runtime JS coverage is WARN/advisory per project instructions.

## Required Artifacts

- `docs_build/dev/reports/PR_26166_165-auth-test-user-cleanup_report.md`
- `docs_build/dev/reports/PR_26166_165-auth-test-user-cleanup_cleanup_report.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26166_165-auth-test-user-cleanup_delta.zip`
