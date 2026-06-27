# PR_26164_122 Supabase DEV Auth Stub

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.
- Started from PR121 outputs.

## Scope

- PASS: Scoped to Supabase Auth adapter stub and sign-in readiness only.
- PASS: Supabase Auth was not activated by default.
- PASS: Local DB does not require a Supabase project.
- PASS: Password tables were not added.
- PASS: Passwords are not stored in app tables.
- PASS: Product data was not moved to Supabase Postgres.
- PASS: Local DB remains active by default.

## Supabase Auth Stub Audit

- PASS: `SupabaseAuthProviderStub` remains behind the provider contract.
- PASS: Future Auth operations exposed:
  - `getCurrentUser`
  - `signIn`
  - `signOut`
  - `createAccount`
  - `requestPasswordReset`
  - `requireRole`
- PASS: Selecting `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth` without config returns `not-configured`.
- PASS: Selecting `supabase-auth` without config keeps active auth provider as `local-db`.
- PASS: Stub operations throw visible actionable diagnostics if called directly.
- PASS: No Supabase package import exists.
- PASS: No Supabase runtime client is created.

## Sign-In Readiness Audit

- PASS: Current sign-in route remains `account/sign-in.html`.
- PASS: Sign-in page returns HTTP 200 through Local API.
- PASS: Create Account remains production-safe because no insecure local account creation was added.
- PASS: Lost Password remains production-safe because no insecure local password reset was added.
- PASS: No local password behavior was introduced.
- PASS: Supabase auth user id mapping is documented in the provider contract:
  - external provider id: `supabase.auth.user.id`
  - app identity key: `users.key`
  - owner: `server-api`
- PASS: Browser-generated authoritative `users.key` values are not allowed.
- PASS: Service role key values are not exposed to browser/API payloads.

## Secrets Audit

- PASS: No Supabase dependency was added.
- PASS: No package manifest or lockfile changed.
- PASS: No real Supabase URL was committed.
- PASS: No anon key, service-role key, JWT-like value, or database URL was committed.
- PASS: No custom password storage exists in the added PR122 diff.
- PASS: No password hashes, reset secrets, or verification secrets were added.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified current branch is `main` before making changes.
- PASS: Started from PR121 outputs.
- PASS: Scoped this PR to Supabase Auth adapter stub and sign-in readiness only.
- PASS: Did not activate Supabase Auth by default.
- PASS: Did not require a Supabase project to run Local DB.
- PASS: Did not add password tables.
- PASS: Did not store passwords in app tables.
- PASS: Did not move product data to Supabase Postgres.
- PASS: Kept Local DB active by default.
- PASS: Added Supabase Auth provider adapter stub operations behind the provider contract.
- PASS: Selected Supabase Auth without config fails visibly with actionable diagnostics.
- PASS: Kept Create Account and Lost Password production-safe when Supabase is not configured.
- PASS: Did not implement insecure local password behavior.
- PASS: Did not use browser-generated authoritative `users.key`.
- PASS: Documented Supabase auth user id mapping to `users.key`.
- PASS: Did not expose service role keys to browser code.

## Validation

- PASS: `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS: `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `npm run dev:local-api` startup validated on `127.0.0.1:5523` with `GAMEFOUNDRY_LOCAL_API_PORT=5523`.
- PASS: Local API selected `supabase-auth` without config and returned a visible `not-configured` diagnostic.
- PASS: Local API active auth/database providers remained `local-db`.
- PASS: Current sign-in route opened with HTTP 200.
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs -g "Sign-in page uses a production-safe account form without public Local DB controls|Protected pages block direct URL access without the required Local session role" --project=playwright`
- PASS: Playwright V8 coverage report produced.
- WARN: Browser V8 coverage reports changed dev-runtime provider files as not collected by browser coverage; these Node-side stubs are covered by targeted Node tests.

## Manual Validation Notes

- `git diff --check`: PASS.
- Runtime files changed: PASS, scoped to the dev-runtime Auth provider stub contract.
- Dependencies added: PASS, none.
- Supabase dependency added: PASS, none.
- Secret-pattern scan: PASS, no matches in PR122 added diff lines.
- Custom password storage: PASS, none added.
- Sign-in behavior changed: PASS, current sign-in route still opens and placeholder form behavior remains.
- Playwright impacted: Yes, targeted sign-in and DB Viewer route-protection tests passed.
- Samples smoke test: SKIP, no samples changed and PR scope is Auth provider stubbing.

## Required Outputs

- PASS: `docs_build/dev/reports/pr122-supabase-dev-auth-stub.md`
- PASS: `docs_build/dev/reports/codex_review.diff`
- PASS: `docs_build/dev/reports/codex_changed_files.txt`
- PASS: `tmp/PR_26164_122-supabase-dev-auth-stub_delta.zip`
