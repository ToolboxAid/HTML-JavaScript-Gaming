# PR_26166_147-supabase-auth-live-validation

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before validation.
- PASS: Main branch guard passed before any report artifacts were produced.
- PASS: No product-table migration was performed.
- PASS: No schema migration was performed.
- PASS: `GAMEFOUNDRY_DB_PROVIDER=local-db` was enforced in the live validation process.
- PASS: Supabase Auth remains the default auth provider; validation used `supabase-auth`.
- PASS: Browser/backend boundary remains API-only; validation called local backend API contracts for auth/session flows.
- PASS: Browser-visible missing-config failure remains generic: `The site is currently unavailable. Please try again later.`
- PASS: Operator diagnostics/evidence include provider/config state and no secret values.
- PASS: No secrets were committed.
- PASS: `.env.local` was read for local validation only and was not modified.
- FAIL: Live Supabase Auth health, Sign In, Create Account, Password Reset, user lookup, role lookup, and user_roles lookup could not complete because Node backend fetch fails TLS verification before HTTP.
- FAIL: Live backend session resolution could not complete because live identity table lookups failed before an active live identity user could be resolved.

## Live Validation Evidence
- Evidence file: `docs_build/dev/reports/supabase-auth-live-validation-evidence.json`.
- Environment presence:
  - `GAMEFOUNDRY_AUTH_PROVIDER`: PRESENT
  - `GAMEFOUNDRY_DB_PROVIDER`: PRESENT
  - `GAMEFOUNDRY_SUPABASE_URL`: PRESENT
  - `GAMEFOUNDRY_SUPABASE_ANON_KEY`: PRESENT
  - `GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY`: PRESENT
- Backend provider selection: PASS
  - auth provider: `supabase-auth`
  - DB provider: `local-db`
  - backend status: ready
- Missing-config generic browser message: PASS
- Live transport result: FAIL
  - sanitized cause code: `UNABLE_TO_VERIFY_LEAF_SIGNATURE`
  - sanitized cause message: `unable to verify the first certificate`
- No Supabase secret values were printed or written to reports.

## Validation Lane Report
- PASS: changed-file syntax/static checks:
  - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
  - `node --check src/dev-runtime/server/local-api-router.mjs`
  - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: targeted auth/provider validation:
  - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
  - Result: 23 passed.
- PASS: Playwright impacted validation:
  - `npm run test:workspace-v2`
  - Result: 5 passed.
- PASS: diff guardrail:
  - `git diff --check`
  - Result: no whitespace errors; line-ending warning only.
- FAIL: live Supabase DEV validation:
  - Live outbound requests failed at Node TLS verification before HTTP response.

## Playwright / V8 Coverage
- Playwright impacted: Yes.
- PASS: `npm run test:workspace-v2` passed.
- V8 coverage: N/A because this PR did not change runtime JavaScript.
- Coverage report path: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Impacted Lanes
- Auth/provider validation lane.
- Live Supabase connectivity/auth validation lane.
- Workspace-contract Playwright lane.

## Skipped Lanes
- Full samples smoke: SKIP. This PR validates Supabase Auth behavior only and does not touch sample runtime behavior.
- Product DB migration: SKIP. Requirement explicitly forbids product-table migration.
- Schema migration: SKIP. No schema changes were required for the attempted validation; live validation failed at TLS transport before schema-level validation could require any migration.

## Manual Validation Notes
- To complete live DEV validation, fix the Node trust chain for the configured Supabase endpoint. The current Node transport error is `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
- After the trust chain is fixed, rerun live validation against the same backend contract.
- Expected live checks after TLS is resolved:
  - `/api/auth/status` reports Supabase Auth with Local DB product data.
  - `/api/auth/sign-in` routes through Supabase Auth and returns sanitized result.
  - `/api/auth/create-account` routes through Supabase Auth and returns sanitized result.
  - `/api/auth/password-reset` routes through Supabase Auth and returns sanitized result.
  - `/api/session/users` and `/api/session/user` resolve users/roles/user_roles through provider-owned identity tables.

## Changed Files
See `docs_build/dev/reports/codex_changed_files.txt`.
