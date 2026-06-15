# PR_26166_143 Preflight Supabase Connectivity

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Scope

- Runtime changes: None
- Migrations: None
- Auth cutover: None
- Product table changes: None
- Samples validation: SKIP, not in scope
- Playwright impacted: No

## Overall Preflight Result

FAIL.

The local configuration variables are present and provider diagnostics report configured state, but live external Supabase Auth/service-role/database checks did not return healthy responses.

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Main branch only | PASS | `git branch --show-current` returned `main`. |
| Read `PROJECT_INSTRUCTIONS.md` | PASS | Read before validation. |
| `GAMEFOUNDRY_SUPABASE_URL` present | PASS | Present from local environment source `.env.local`; value not printed. |
| `GAMEFOUNDRY_SUPABASE_ANON_KEY` present | PASS | Present from local environment source `.env.local`; value not printed. |
| `GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY` present | PASS | Present from local environment source `.env.local`; value not printed. |
| `GAMEFOUNDRY_SUPABASE_DATABASE_URL` present | PASS | Present from local environment source `.env.local`; value not printed. |
| Supabase URL reachable | PASS | DNS resolved and HTTPS host responded. The root host returned HTTP 404, which confirms network reachability but not app/API health. |
| Auth endpoint reachable | FAIL | `GET /auth/v1/health` returned HTTP 404 with the configured anon key. |
| Service-role authentication succeeds | FAIL | `GET /auth/v1/admin/users?page=1&per_page=1` returned HTTP 401 with the configured service-role key. |
| Database connection succeeds | FAIL | `GET /rest/v1/users?select=key&limit=1` returned HTTP 401 with the configured service-role key. Direct database host TCP connected and accepted SSL, but authenticated database access was not proven. |
| `/api/auth/status` returns healthy diagnostics | PASS | Local API route returned HTTP 200, `ok=true`, `ready=true`, `configured=true`, `status=ready`, `message=Account service is available.` |
| No browser-visible secrets | PASS | Provider contract flags report `secretValuesExposed=false`, `serverOnlyEnvironmentVariableNamesExposed=false`, and the service-role/database URL values were not present in serialized browser-facing diagnostics. |
| Provider diagnostics report configured state | PASS | Provider contract with Supabase Auth and Supabase Postgres selected reported `activeProviders.status=ready`, `supabaseAuth.configured=true`, `supabasePostgres.configured=true`, `supabasePreflight.overallStatus=PASS`, and `siteSetupReady=true`. |

## Sanitized Connectivity Evidence

| Check | Result | Sanitized detail |
| --- | --- | --- |
| DNS | PASS | Supabase host resolved to public IPs. |
| HTTPS host | PASS | Host responded over HTTPS. |
| REST root with anon key | FAIL | HTTP 404. |
| Auth health with anon key | FAIL | HTTP 404. |
| Auth admin users with service-role key | FAIL | HTTP 401. |
| REST users table with service-role key | FAIL | HTTP 401. |
| Direct database URL transport | INFO | Host and port present; TCP connected; SSL accepted. Node TLS authorization reported `SELF_SIGNED_CERT_IN_CHAIN`; no authenticated SQL session was attempted because no database client is available in this repo. |

## Validation Commands

- PASS: `git branch --show-current`
- PASS: `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- PASS: local environment presence check for required Supabase variables; values were not printed.
- PASS: `Resolve-DnsName <supabase-host>`; host resolved.
- PASS/FAIL: targeted HTTP connectivity checks via `Invoke-WebRequest`; see requirement checklist.
- PASS: local `/api/auth/status` route check using the existing backend contract.
- PASS: provider diagnostics configured-state check using the existing provider contract.
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` passed 15/15 tests.

## Validation Lane Report

- Impacted lane: contract/auth-provider preflight only.
- Runtime JavaScript changed: No.
- Playwright impacted: No.
- Samples: SKIP. No sample files or runtime sample behavior changed.
- Migrations: SKIP. The PR explicitly forbids migrations/schema changes.
- Auth cutover: SKIP. The PR explicitly forbids auth cutover.

## Manual Notes

- The local environment source is `.env.local`, which remains untracked and was not included in review artifacts or the delta ZIP.
- The service-role key currently configured did not authenticate successfully against the Supabase Auth admin endpoint.
- The database REST endpoint also rejected the configured service-role key with HTTP 401.
- Recommended next action is to re-check the Supabase API key values in the dashboard and confirm the configured service-role/secret key is valid for this project before attempting any migration or cutover.

