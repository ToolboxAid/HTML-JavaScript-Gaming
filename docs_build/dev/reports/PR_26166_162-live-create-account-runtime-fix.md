# PR_26166_162-live-create-account-runtime-fix

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Summary

Fixed the manual Create Account runtime failure by making `npm run dev:local-api` load `.env.local`, use Node system CA certificates, and select Supabase Auth for the local API when DEV Supabase Auth configuration is present. Product data remains on `GAMEFOUNDRY_DB_PROVIDER=local-db`.

## Actual Failing Diagnostic

Reproduced by POSTing through the running local API before the provider-selection fix:

```text
[auth/operator] POST /api/auth/create-account failed: Create account: Supabase Auth is not ready. Supabase Auth configuration is present, but selected auth provider is local-db. Set GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth to activate external account authentication while keeping GAMEFOUNDRY_DB_PROVIDER=local-db for product data.
```

Root cause: `npm run dev:local-api` did not load `.env.local`, did not use the same system CA behavior as `validate:supabase-dev`, and the local `.env.local` selected `GAMEFOUNDRY_AUTH_PROVIDER=local-db`. The Create Account backend never reached the ready Supabase Auth path.

## Fix Evidence

- `package.json`: `dev:local-api` now starts Node with `--use-system-ca`.
- `scripts/start-local-api-server.mjs`: loads `.env.local` without printing secret values.
- `scripts/start-local-api-server.mjs`: selects `supabase-auth` for the local API when Supabase DEV auth config is present.
- `scripts/start-local-api-server.mjs`: keeps product data provider as `local-db`.
- No `.env.local` changes.
- No password tables.
- No browser-owned auth/provider logic.
- No silent fallback to Local DB auth.

Post-fix `/api/auth/status` evidence:

```text
authProviderId: supabase-auth
databaseProviderId: local-db
ready: true
selected: true
configured: true
identityTablesReady: true
message: Account service is available.
```

## Manual Browser Validation

Used Playwright to drive the real browser pages on the running local API:

- Opened `http://127.0.0.1:5501/account/create-account.html`.
- Submitted the visible Create Account form.
- Captured `POST /api/auth/create-account` response.
- Opened `http://127.0.0.1:5501/account/sign-in.html`.
- Submitted the visible Sign In form.
- Queried `/api/session/current` after sign-in.

Result:

```text
Create Account HTTP: 200
Create Account UI status: Account created. You can sign in after confirming your email.
identityProvisioned: true
users row created: true
user_roles row created: true
roleSlugs: user
Sign In HTTP: 200
sessionAuthenticated: true
sessionUserKeyMatchesCreatedUser: true
sessionRoles: user
failedRequests: none
```

## Requirement Checklist

- Main branch only: PASS
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`: PASS
- Do not make test-only changes: PASS
- Reproduce manual failure through Create Account runtime path: PASS
- Capture server-side `[auth/operator]` diagnostic: PASS
- Fix runtime cause: PASS
- Keep `GAMEFOUNDRY_DB_PROVIDER=local-db`: PASS
- No secrets or `.env.local` commits: PASS
- No password tables: PASS
- No browser-owned auth/provider logic: PASS
- No silent fallback: PASS
- Manual browser Create Account succeeds before reporting PASS: PASS
- Validate account created, users row, user_roles row, and sign-in works: PASS

## Validation Performed

- `node --check scripts/start-local-api-server.mjs` - PASS
- `node --check src/dev-runtime/server/local-api-router.mjs` - PASS
- `npm run validate:supabase-dev` - PASS with expected advisory direct PostgreSQL TLS WARN; REST/API identity checks passed.
- `npm run dev:local-api` - PASS, server running at `http://127.0.0.1:5501/`.
- Real browser Create Account and Sign In validation - PASS.
- `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` - PASS, 28 tests.
- `npm run test:workspace-v2` - PASS, 5 Playwright tests.
- `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --project=playwright --workers=1 --reporter=list --grep "Configured account auth actions|Create Account shows generic"` - PASS, 2 tests.

## Validation Notes

- Attempted full `LoginSessionMode.spec.mjs`; it exceeded the command timeout before producing useful output. Re-ran the relevant Create Account and external auth tests by grep and they passed.
- Full samples smoke was skipped because the PR only affects auth/local API startup and account flow validation, not sample runtime behavior.

## Impacted Lanes

- runtime
- integration
- account/auth session

## Changed Files

- `package.json`
- `scripts/start-local-api-server.mjs`
- Validation reports under `docs_build/dev/reports/`
- `docs_build/dev/reports/PR_26166_162-live-create-account-runtime-fix.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

