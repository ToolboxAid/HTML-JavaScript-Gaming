# PR_26166_131-supabase-dev-activation-runtime

## Branch Validation

PASS - Current branch is `main`.

## Scope

PASS - Stayed in the DB/Auth migration lane. This PR wires Supabase DEV activation diagnostics and Local API runtime guards only; it does not migrate data or make Supabase active by default.

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS - Started from PR126-PR130 provider/audit outputs.
- PASS - Supabase is not activated automatically.
- PASS - No secrets were added.
- PASS - No password storage or custom password tables were added.
- PASS - No MEM DB, fake-login, or `login.html` behavior was introduced.
- PASS - Browser -> API/Service Contract -> Database is preserved.
- PASS - Provider selection controls are exposed through provider diagnostics:
  - `GAMEFOUNDRY_AUTH_PROVIDER`
  - `GAMEFOUNDRY_DB_PROVIDER`
  - supported auth providers: `local-db`, `supabase-auth`
  - supported database providers: `local-db`, `supabase-postgres`
- PASS - Local DB remains active when explicitly selected.
- PASS - Selecting Supabase without complete config keeps Supabase selected, reports failure, and blocks Local DB session/data routes.
- PASS - Browser diagnostics do not expose service-role secret values or server-only secret names.
- PASS - Current sign-in route still opens when Local DB is selected.
- PASS - DB Viewer still opens and uses Local DB when Local DB is selected.

## Runtime Wiring Evidence

- Added `providerDiagnostics.selectionControls` to the provider contract snapshot.
- Added `runtimeActivation` diagnostics:
  - selected provider readiness
  - whether Local DB is selected
  - whether Supabase Auth/Postgres are selected
  - browser service-role exposure remains `false`
- Added Local API guards:
  - local session routes require selected auth provider `local-db`
  - Local DB data routes require selected database provider `local-db`
  - provider contract routes remain readable for diagnostics
- Selected Supabase without config now returns visible route errors instead of serving Local DB data.

## Secrets Audit

- PASS - `.env.example` contains placeholders only.
- PASS - No package dependency was added.
- PASS - Runtime provider diagnostics expose `serverOnlySupabaseCount`, not service-role names or values.
- PASS - Secret-like strings found by scan are test placeholders only and are asserted not to appear in API responses.

## Local DB Default Audit

- PASS - `npm run dev:local-api` started on port `5531` with explicit local selectors.
- PASS - `/api/providers/contract` returned `local-db/local-db` with status `ready`.
- PASS - `account/sign-in.html` returned HTTP 200.
- PASS - `admin/db-viewer.html` returned HTTP 200.

## Validation Lane Report

- PASS - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` passed 11/11 tests.
- PASS - `npm run dev:local-api` route smoke with explicit Local DB selectors.
- PASS - `git diff --check -- . ':!docs_build/dev/reports/codex_review.diff'`
- WARN - Full `git diff --check` was deferred until regenerated review artifact output because the prior generated `codex_review.diff` contains normal diff context blank lines that Git flags as trailing whitespace.
- SKIP - Playwright: no browser page behavior changed; affected runtime behavior is Local API/provider diagnostics and covered by targeted Node/runtime tests.
- SKIP - Full samples smoke: samples are outside this DB/Auth provider activation scope.

## Manual Validation Notes

- Existing `local-mem` reference is in `tests/dev-runtime/DbSeedIntegrity.test.mjs` and verifies the retired mode is rejected.
- Selected Supabase missing config was validated through the Local API test server:
  - `/api/providers/contract` remains available.
  - `/api/session/current` returns visible auth-provider failure.
  - `/api/local-db/snapshot` returns visible database-provider failure.
- No AI Platform files were changed.
