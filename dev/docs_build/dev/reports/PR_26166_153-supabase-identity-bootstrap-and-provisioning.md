# PR_26166_153-supabase-identity-bootstrap-and-provisioning

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before implementation.
- PASS: `GAMEFOUNDRY_DB_PROVIDER=local-db` is preserved; product data remains Local DB.
- PASS: Supabase identity table validation was added for `users`, `roles`, and `user_roles`.
- PASS: `/api/auth/status` now requires Supabase Auth connectivity and identity table reachability before `ready=true`.
- PASS: Create Account creates the Supabase Auth user through the backend API and provisions matching app identity records server-side.
- PASS: Provisioning creates/updates `users`, ensures the default `user` role, and inserts `user_roles` with server-generated keys.
- PASS: Sign In resolves session/user/roles from Supabase identity records.
- PASS: Password Reset remains Supabase Auth only.
- PASS: No secrets or `.env.local` files were committed or modified.
- PASS: Browser pages continue to use backend API contracts only; no browser-owned auth/provider/data logic was added.
- PASS: No silent fallback was added.
- FAIL: Real configured Supabase DEV readiness could not be validated as `ready=true` from this machine because the live connectivity check fails before HTTP with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.

## Validation Lane Report
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Sign-in page uses|Configured account auth actions" --reporter=list`
- PASS: `npm run test:workspace-v2`
- FAIL: Real DEV `/api/auth/status` readiness probe with local `.env.local` values present:
  - `selected=true`
  - `configured=true`
  - `localDbProductDataActive=true`
  - `connectivityStatus=failed`
  - `identityTablesReady=false`
  - `ready=false`
  - operator preflight: `Supabase Auth request failed before an HTTP status was available. (UNABLE_TO_VERIFY_LEAF_SIGNATURE)`

## Playwright Impact
- Playwright impacted: Yes.
- Coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Coverage WARN: Node server runtime JS is not collected by browser V8 coverage; browser account auth JS remains covered by the focused auth Playwright run.

## Manual Validation Notes
- Fake Supabase provider validation proves:
  - `/api/auth/status` returns `ready=true` when Auth connectivity and identity tables are reachable.
  - Create Account provisions one app `users` row, one default `roles` row when needed, and one `user_roles` row.
  - Sign In resolves a session using the provisioned identity record and role.
  - Missing identity rows fail with the generic production-safe browser message.
- Real DEV validation is blocked by local Node TLS trust, not by missing environment values. Required env presence was verified without printing secret values.

## Skipped Lanes
- Full samples smoke: SKIP. Auth identity bootstrap/provisioning does not touch samples or sample manifests.

## Changed Files
- `src/dev-runtime/server/local-api-router.mjs`
- `tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- Validation/report artifacts under `docs_build/dev/reports/`

## Review Artifacts
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
