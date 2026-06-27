# PR_26166_146-supabase-auth-default-provider

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before changes.
- PASS: Default auth provider selection changed from `local-db` to `supabase-auth` in the provider contract.
- PASS: `GAMEFOUNDRY_DB_PROVIDER` remains `local-db` by default.
- PASS: Product data remains on Local DB; no product table migration was added.
- PASS: `users`, `roles`, and `user_roles` remain provider-owned through the identity ownership contract from PR145.
- PASS: Browser pages continue using backend API contracts only; no browser-side provider branching was added.
- PASS: Sign In, Create Account, and Password Reset route through Supabase Auth by default when config exists.
- PASS: Missing Supabase configuration fails visibly with the production-safe unavailable message and no local-db auth fallback.
- PASS: Guest browsing remains enabled; unauthenticated sessions still return guest state.
- PASS: Guest save redirects were not changed.
- PASS: No password tables or local password storage were added.
- PASS: No secrets were committed.
- PASS: No user `.env.local` files were modified.

## Implementation Summary
- `.env.example`: documents `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth` with `GAMEFOUNDRY_DB_PROVIDER=local-db`; Supabase values remain blank.
- `src/dev-runtime/auth/provider-contract-stubs.mjs`: adds explicit default provider constants and changes the auth default to `supabase-auth`; keeps database default as `local-db`; marks the Supabase Auth adapter active-by-default while still config-gated.
- `tests/dev-runtime/SupabaseProviderContractStub.test.mjs`: adds default startup, missing-config, and configured default Sign In/Create Account/Password Reset coverage.
- `tests/playwright/tools/RootToolsFutureState.spec.mjs`: explicitly selects Local DB auth for the legacy toolbox workspace-contract test file so its local-admin session setup remains deterministic under the new global auth default.

## Validation Lane Report
- PASS: changed-file syntax/static checks:
  - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
  - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
  - `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- PASS: targeted auth/provider validation:
  - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
  - Result: 23 passed.
- PASS: default startup selects Supabase Auth:
  - Test validates no `GAMEFOUNDRY_AUTH_PROVIDER` selects `supabase-auth` and no `GAMEFOUNDRY_DB_PROVIDER` selects `local-db`.
- PASS: configured path:
  - Test validates default Sign In/Create Account/Password Reset calls route to the fake external Supabase Auth service when browser-safe config is present.
- PASS: missing-config path:
  - Test validates default startup with no Supabase config returns visible unavailable state and rejects sign-in with no local-db fallback.
- PASS: Playwright impacted lane:
  - `npm run test:workspace-v2`
  - Result: 5 passed.
  - Note: first run exposed a legacy workspace-contract local-auth assumption; the test file now explicitly selects Local DB auth for that non-auth lane and final rerun passed.
- PASS: V8 coverage:
  - `docs_build/dev/reports/playwright_v8_coverage_report.txt`
  - Covers changed runtime JS: `src/dev-runtime/auth/provider-contract-stubs.mjs`.
- PASS: diff guardrail:
  - `git diff --check`
  - Result: no whitespace errors; line-ending warnings only.

## Impacted Lanes
- Auth/provider contract lane.
- Auth action routing lane.
- Workspace-contract Playwright lane because the default auth provider changed.

## Skipped Lanes
- Full samples smoke: SKIP. This PR changes auth provider defaults and auth/session validation only; no sample runtime behavior changed.
- Product DB migration: SKIP. Requirement explicitly keeps product data on Local DB and does not migrate product tables.

## Manual Validation Notes
- Start the Local API without `GAMEFOUNDRY_AUTH_PROVIDER`; call `/api/auth/status` and verify `authProviderId=supabase-auth`, `databaseProviderId=local-db`, and missing config reports the generic unavailable message.
- Add local Supabase URL and anon key in the local environment only; call `/api/auth/sign-in`, `/api/auth/create-account`, and `/api/auth/password-reset` and verify they route through backend auth APIs.
- Confirm `.env.example` has blank Supabase URL/key values and no secrets.
- Confirm `.env.local` or user env files are unchanged.

## Changed Files
See `docs_build/dev/reports/codex_changed_files.txt`.
