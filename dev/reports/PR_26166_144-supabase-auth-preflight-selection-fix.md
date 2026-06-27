# PR_26166_144 Supabase Auth Preflight Selection Fix

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Summary

Updated auth/provider diagnostics so Supabase configuration, provider selection, and connectivity are distinct states.

- `/api/auth/status` now reports `status=provider-not-selected` when Supabase config exists but `GAMEFOUNDRY_AUTH_PROVIDER=local-db`.
- Browser-facing unavailable text remains generic: `The site is currently unavailable. Please try again later.`
- Operator diagnostics may state provider selection and the required auth-provider env switch.
- Added safe operator preflight route: `GET /api/auth/operator-preflight`.
- Operator preflight checks Supabase Auth connectivity without switching product data away from `GAMEFOUNDRY_DB_PROVIDER=local-db`.
- No migrations, secrets, product-table writes, or auth cutover were added.

Delta ZIP: `tmp/PR_26166_144-supabase-auth-preflight-selection-fix_delta.zip`

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Main branch only | PASS | `git branch --show-current` returned `main`. |
| Read `PROJECT_INSTRUCTIONS.md` | PASS | Read before changes. |
| Do not migrate users/roles/user_roles/product tables | PASS | No migration or schema code changed. |
| Do not add secrets | PASS | No secret values added; `.env.local` remains local-only and is not packaged. |
| Do not commit `.env` files | PASS | No `.env` file is included in review artifacts or delta ZIP. |
| Keep `GAMEFOUNDRY_DB_PROVIDER=local-db` | PASS | Operator preflight reports `localDbProductDataActive=true`; tests keep product DB local. |
| Distinguish Supabase config present | PASS | `/api/auth/status` and operator preflight expose `supabaseConfigPresent`. |
| Distinguish Supabase provider selected | PASS | Diagnostics expose `supabaseProviderSelected`. |
| Distinguish Supabase provider not selected | PASS | Diagnostics expose `supabaseProviderNotSelected`; Local DB selected path reports `provider-not-selected`. |
| Distinguish connectivity healthy | PASS | Operator preflight returns `connectivityStatus=healthy` in fake healthy path. |
| Distinguish connectivity failed | PASS | Operator preflight returns `connectivityStatus=failed` and sanitized HTTP status in wrong-key path. |
| `/api/auth/status` not misleading when config exists but Local DB auth selected | PASS | Sanitized local check returned `configured=true`, `status=provider-not-selected`, `supabaseProviderSelected=false`, `ready=false`. |
| Add safe operator-only preflight path/command | PASS | Added `GET /api/auth/operator-preflight`; report documents local command evidence. |
| Browser-facing message remains generic | PASS | Non-ready status still returns `The site is currently unavailable. Please try again later.` |
| Operator diagnostics may state selected provider/env switch | PASS | `operatorDiagnostic` states selected auth provider and `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth` switch. |
| No browser-visible secrets | PASS | Tests assert preflight/status payloads do not contain fake key values. |
| No silent fallback | PASS | Diagnostics keep `noAutomaticFallback=true`; missing/wrong config fails visibly. |

## Validation Lane Report

- Impacted lane: auth/provider contract and browser-facing auth status route.
- Runtime JavaScript changed: Yes, server-side Local API router.
- Playwright impacted: Yes, because `/api/auth/status` is browser-facing route behavior.
- Samples: SKIP. No samples or game runtime changed.
- Migrations/schema: SKIP. Explicitly out of scope.
- Auth cutover: SKIP. Explicitly out of scope.

## Validation Performed

- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` passed 17/17 tests.
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs` passed 13/13 tests.
- PASS: Sanitized local `.env.local` route check:
  - Local DB auth selected: `/api/auth/status` returned `configured=true`, `ready=false`, `status=provider-not-selected`, `supabaseConfigPresent=true`, `supabaseProviderSelected=false`, `supabaseConnectivityStatus=not-checked`, generic browser message.
  - Supabase Auth selected with Local DB product data: `/api/auth/status` returned `configured=true`, `ready=true`, `status=ready`, `supabaseProviderSelected=true`, `supabaseConnectivityStatus=not-checked`.
  - Operator preflight with current local env: `/api/auth/operator-preflight` returned `localDbProductDataActive=true`, `connectivityStatus=failed`.
- PASS: `git diff --check` with line-ending warnings only.

## Playwright / V8 Coverage

- PASS: Targeted auth/session Playwright passed 13/13.
- PASS/WARN: `docs_build/dev/reports/playwright_v8_coverage_report.txt` refreshed.
- Server-side `src/dev-runtime/server/local-api-router.mjs` is listed as WARN because browser V8 coverage does not collect Node server modules; it is covered by the targeted Node provider tests and Playwright route behavior.

## Manual Validation Notes

1. Keep product DB local: set `GAMEFOUNDRY_DB_PROVIDER=local-db`.
2. With Supabase config present and `GAMEFOUNDRY_AUTH_PROVIDER=local-db`, call `/api/auth/status`.
3. Confirm response includes `status=provider-not-selected`, `supabaseConfigPresent=true`, `supabaseProviderSelected=false`, and the generic browser message.
4. With `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth`, call `/api/auth/status`.
5. Confirm response includes `status=ready` when config exists, with connectivity still `not-checked`.
6. Call `/api/auth/operator-preflight` to validate live connectivity without switching product DB provider.
7. Confirm the response reports connectivity as `healthy` or `failed` without exposing secret values.

## Notes

- Current local live operator preflight still reports Supabase connectivity failed. That is expected until the configured Supabase Auth/API key values are corrected; the purpose of this PR is to make that failure explicit without mislabeling provider-selection state or changing product data providers.

