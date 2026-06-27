# PR_26166_130-provider-failure-contract

## Branch Validation

PASS - Current branch is `main`.

## Scope

PASS - Stayed in the DB/Auth migration lane and changed only provider contract diagnostics/config comments, targeted provider tests, and required reports.

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS - Started from the current repo state after PR126-129 reports.
- PASS - Supabase is not automatically activated; provider selectors are authoritative only when set.
- PASS - No secrets were added.
- PASS - No MEM DB, local-mem, fake-login, or `login.html` behavior was introduced.
- PASS - Browser -> API/Service Contract -> Database boundary is preserved.
- PASS - If the selected provider is unsupported, diagnostics keep the selected provider and report failure instead of falling back to Local DB.
- PASS - If Supabase is selected without required config, diagnostics keep Supabase selected and report actionable missing configuration failure.
- PASS - Removed provider-contract rollback-to-Local-DB language from provider failure diagnostics.
- PASS - Local DB remains healthy when explicitly selected by `GAMEFOUNDRY_AUTH_PROVIDER=local-db` and `GAMEFOUNDRY_DB_PROVIDER=local-db`.

## Provider Failure Contract Evidence

- `createProviderContractSnapshot()` now reports `activeProviders.authProviderId` and `activeProviders.databaseProviderId` from the selected provider values.
- `activeProviders.status` reports `failed` when the selected provider is unsupported or missing required configuration.
- `failureContract.automaticFallbackAllowed` is `false`.
- `failureContract.providerChainingAllowed` is `false`.
- `failureContract.selectedProviderAuthoritative` is `true`.
- `providerDiagnostics.providerFailures[]` lists unsupported-provider and missing-configuration failures without exposing server-only secret names or values.
- `.env.example` now documents explicit Local DB selection and diagnostic failure behavior without adding values.

## Validation Lane Report

- PASS - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` passed 10/10 tests.
- PASS - Local API route smoke: `/api/providers/contract` returned `200 true local-db/local-db ready`.
- PASS - `git diff --check`
- SKIP - Playwright: no browser UI page behavior changed; provider contract coverage is targeted Node/runtime API validation.
- SKIP - Full samples smoke: samples are outside this DB/Auth provider-contract scope.

## Manual Validation Notes

- Confirmed selected Supabase without config reports Supabase as selected and failed, not Local DB.
- Confirmed unsupported selected providers report failure and do not fall back to Local DB.
- Confirmed provider snapshots do not contain rollback wording.
- Confirmed server-only Supabase values are not exposed through the Local API provider contract response.
