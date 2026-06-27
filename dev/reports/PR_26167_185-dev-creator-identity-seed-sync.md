# PR_26167_185-dev-creator-identity-seed-sync

## Overall Result

FAIL / blocked.

The implementation was prepared and targeted validation passed, but the live DEV seed/sync could not complete because Supabase Auth rejected the requested User 1/User 2/User 3 password values as shorter than the project minimum password length. Supabase returned HTTP 422: password must be at least 6 characters. Supabase settings were not changed.

## Branch Validation

PASS - current branch was `main` before changes.

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.
- PASS - Hard stop branch check passed on `main`.
- PASS - DEV-only sync path added under server-side scripts/runtime testing code.
- FAIL - Requested User 1/User 2/User 3 passwords could not be applied; Supabase Auth rejected the requested short values.
- PASS - DavidQ seed name is `DavidQ`, not `DavidQ admin`.
- PASS - DavidQ is not statically seeded as admin; explicit existing admin assignments are preserved when present.
- FAIL - Extra codex/qbytes DEV accounts were identified but not deleted because the live sync hard-stopped before cleanup.
- FAIL - Auth users and `public.users` were not fully synced in DEV because the live sync failed.
- PASS - `authProvider="supabase-auth"` and real `auth.users.id` sync behavior is implemented in the server-side sync path.
- PASS - `creator` is the default authenticated Creator role in seed data and create-account provisioning.
- PASS - `guest` remains available for unauthenticated browsing.
- PASS - `admin` is retained only as an explicit assignment.
- PASS - `roleSlug=user` is marked inactive/deprecated in seed data.
- PASS - Dev-static seed docs/data and server-side seed/setup scripts were updated.
- PASS - Seeding remains server-side only.
- PASS - No SQLite/local-db fallback was added.
- PASS - No browser-owned user records were added.
- PASS - Startup wording reports configured account/product-data connections; script name retained as legacy command naming only.

## Before/After Identity Counts

Live sync hard-stopped before mutation. A dry-run snapshot after the failed attempt reported:

| Count | Before | After Dry Run |
| --- | ---: | ---: |
| Supabase Auth users | 12 | 12 |
| `public.users` rows | 12 | 12 |
| Canonical Auth identities | 2 | 2 |
| Canonical `public.users` identities | 3 | 3 |
| Managed extra Auth identities | 10 | 10 |
| Managed extra `public.users` identities | 8 | 8 |

Actual created records: 0.

Actual deleted records: 0.

## Deleted DEV Account List

No live deletions were performed because the sync failed before cleanup.

Dry-run cleanup candidates identified:

- `codex-pr162-1781561056924-35f5412b0f339@example.com`
- `codex-pr162-1781561106580-fe3f2462707fc@example.com`
- `codex-pr163-repeat-1781562780241-ccbc9d07d9f97@example.com`
- `codex-pr163-success-1781562780241-ccbc9d07d9f97@example.com`
- `codex-pr156-missing-identity-1781555713293-c32794@example.test`
- `codex-pr156-admin-probe-1781554902135-23gra6@example.com`
- `qbytes.dq1@gmail.com`
- `qbytes.dq2@gmail.com`
- `qbytes.dq3@gmail.com`
- `qbytes.dq4@gmail.com`

## Auth/Public Users Sync Evidence

Dry-run verification, with Auth IDs omitted:

- `user1@example.invalid`: Auth present, `public.users` present, not synced to real Auth ID yet.
- `user2@example.invalid`: Auth missing, `public.users` present.
- `user3@example.invalid`: Auth missing, `public.users` present.
- `qbytes.dq@gmail.com`: Auth present, `public.users` missing.

Creator role assignments were not present for the four canonical identities in live DEV at dry-run time.

## Validation Lane Report

- PASS - `node --check` for changed JS/MJS files.
- FAIL - `node .\scripts\validate-supabase-dev.mjs`; local TLS trust failed with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` / `SELF_SIGNED_CERT_IN_CHAIN`.
- PASS - `npm run validate:supabase-dev`; REST/API readiness passed, direct PostgreSQL TLS warning remained advisory.
- FAIL - `node --use-system-ca .\scripts\sync-supabase-dev-creator-identities.mjs --json`; Supabase Auth HTTP 422 for requested short passwords.
- PASS - `node --use-system-ca .\scripts\sync-supabase-dev-creator-identities.mjs --dry-run --json`.
- PASS - `node --test tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`.
- PASS - `node --test tests/dev-runtime/SupabaseProductDataCutover.test.mjs`.
- PASS - Targeted provider contract tests for Auth admin methods, auth routes, create-account provisioning, and Supabase session/product read path.
- TIMEOUT - Full `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` did not complete within 240 seconds; targeted changed cases passed.
- PASS - `npm run dev:local-api` startup check on port 55185 returned HTTP 200 for `/api/auth/status`; startup logs contained no SQLite/local-db/provider-selection wording.
- PASS - `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs --project=playwright --workers=1 --reporter=list`.
- PASS - `npm run test:workspace-v2`.

Playwright V8 coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Manual Validation Notes

- Live DEV sign-in with the requested canonical short passwords was not validated because Supabase Auth rejected those passwords before sync completed.
- No UAT/PROD resources were touched.
- No `.env.local` or secret files were changed.
- No password values are recorded in this report.
- Startup command remains `scripts/start-local-api-server.mjs`; report and logs treat that as legacy command naming only.
