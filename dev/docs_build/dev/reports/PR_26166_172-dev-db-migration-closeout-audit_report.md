# PR_26166_172-dev-db-migration-closeout-audit

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` read before PR_172 execution.

## Scope Summary

PASS

- Completed the DEV DB migration closeout audit after PR_166 through PR_171.
- Confirmed Supabase Auth is active for DEV.
- Confirmed Supabase Postgres is active for DEV product data.
- Confirmed Local DB/SQLite no longer owns migrated DEV product data when the local API runs with the default Supabase provider pair.
- Confirmed required DEV identity/product bootstrap rows remain and validation-only records are cleaned.
- Confirmed no secrets or `.env.local` are included in the delta.
- Did not create UAT/PROD resources.
- Did not add runtime code in this closeout PR.

## Requirement Checklist

- PASS - Treat PR_172 as one separate BUILD unit.
- PASS - Main branch only; current branch was `main`.
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before work.
- PASS - DEV DB migration complete audit performed.
- PASS - Supabase Auth active: live `/api/providers/contract` returned `authProviderId=supabase-auth`.
- PASS - Supabase product DB active: live `/api/providers/contract` returned `databaseProviderId=supabase-postgres`.
- PASS - `/api/auth/status` reported `ready=true`, `identityTablesReady=true`, `supabaseProductDataActive=true`, and `localDbProductDataActive=false`.
- PASS - `/api/local-db/snapshot` compatibility route returned `source=supabase-postgres` and `provider.databaseProviderId=supabase-postgres`.
- PASS - `/api/toolbox/registry/snapshot` returned `providerId=supabase-postgres`, `source=supabase-postgres`, and 45 active tools.
- PASS - SQLite/Local DB no longer owns migrated product data under the DEV Supabase provider pair.
- PASS - No non-empty Supabase key/database values were found in the diff.
- PASS - `.env.local` is not tracked or changed.
- PASS - Codex-created test records are cleaned; cleanup found zero candidate/deleted records.
- PASS - No UAT/PROD resources were created.
- PASS - `npm run validate:supabase-dev` ran and passed with one advisory DEV TLS warning.
- PASS - Targeted auth/session validation ran.
- PASS - Targeted provider/API validation for migrated product areas ran.
- PASS - `npm run test:workspace-v2` ran and passed because this closeout audits a stacked migration that changed shared runtime/API/session surfaces; command name is legacy and user-facing language is Project Workspace.
- PASS - Full samples smoke was not run.

## Live DEV Closeout Evidence

Live local API was started with:

- `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth`
- `GAMEFOUNDRY_DB_PROVIDER=supabase-postgres`
- command: `npm run dev:local-api`

Probe result:

```json
{
  "authProviderId": "supabase-auth",
  "databaseProviderId": "supabase-postgres",
  "authReady": true,
  "authStatus": "ready",
  "identityTablesReady": true,
  "localDbProductDataActive": false,
  "supabaseProductDataActive": true,
  "snapshotSource": "supabase-postgres",
  "snapshotDatabaseProviderId": "supabase-postgres",
  "registryProviderId": "supabase-postgres",
  "registrySource": "supabase-postgres",
  "registryActiveTools": 45,
  "repositoryId": "game-workspace-1",
  "productCounts": {
    "toolbox_tool_metadata": 45,
    "toolbox_tool_planning": 45,
    "toolbox_votes": 0,
    "asset_library_items": 0,
    "palette_colors": 0
  }
}
```

Interpretation:

- PASS - DEV auth provider is Supabase Auth.
- PASS - DEV product database provider is Supabase Postgres.
- PASS - Product data snapshot and Toolbox registry are sourced from Supabase Postgres.
- PASS - Local DB product ownership flag is false.
- PASS - Toolbox metadata/planning bootstrap rows are present in Supabase Postgres.
- PASS - Repository probe opened a server repository id and did not persist a validation product row.

## Validation Lane Report

Executed lanes:

- branch/instructions:
  - `git branch --show-current`
  - read `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- Supabase DEV readiness:
  - `npm run validate:supabase-dev`
- provider/API contract:
  - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs tests/dev-runtime/SupabaseProductDataCutover.test.mjs tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- targeted auth/session Playwright:
  - `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs --project=playwright --workers=1 --reporter=list`
- Project Workspace legacy lane:
  - `npm run test:workspace-v2`
- live DEV local API closeout:
  - `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth GAMEFOUNDRY_DB_PROVIDER=supabase-postgres npm run dev:local-api`
  - probed `/api/providers/contract`, `/api/auth/status`, `/api/local-db/snapshot`, `/api/toolbox/registry/snapshot`, and `POST /api/toolbox/game-workspace/repositories`
- cleanup:
  - `npm run cleanup:supabase-dev-auth-test-users`
- secret hygiene:
  - `git status --short -- .env.local`
  - `git ls-files .env.local`
  - non-empty Supabase key/database value scan in git diff

Skipped lanes:

- Full samples smoke: SKIP by request and because samples are not in scope.
- UAT/PROD validation: SKIP by request; no UAT/PROD resources were created.
- Broad all-Playwright suite: SKIP because closeout validation used targeted auth/session, provider/API, Admin DB Viewer coverage from PR_171, and Project Workspace legacy lane.

## Validation Results

- PASS - `npm run validate:supabase-dev`.
- WARN - `npm run validate:supabase-dev` direct PostgreSQL TLS check reported `SELF_SIGNED_CERT_IN_CHAIN`; REST/API identity readiness passed, so this remains advisory for DEV.
- PASS - Provider/API contract tests: 36 tests passed.
- PASS - Targeted auth/session Playwright: 1 test passed.
- PASS - `npm run test:workspace-v2`: 5 Project Workspace legacy-lane tests passed.
- PASS - Live local API provider/source probe.
- PASS - `npm run cleanup:supabase-dev-auth-test-users`: 0 candidate test records, 0 deleted records, 12 non-test identity records skipped.
- PASS - `.env.local` is not tracked.
- PASS - No non-empty Supabase key/database values were found in the diff.
- PASS - Port 5501 was cleared after live local API validation.

## Manual Validation Notes

- The DEV local API loaded `.env.local` for runtime configuration, but `.env.local` was not modified or committed and secrets were not printed.
- Supabase Auth is active and ready in DEV.
- Supabase Postgres owns migrated DEV product data under the selected provider pair.
- `/api/local-db/snapshot` remains a compatibility route name only; its closeout source/provider data confirms Supabase Postgres ownership.
- Product bootstrap rows remaining in Supabase Postgres are required DEV migration records, not validation-only records.
- No Codex-created validation-only live records are known to remain.
- The closeout did not create UAT/PROD resources.

## Playwright V8 Coverage

- Updated coverage report exists at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- PR_172 added audit/report artifacts only and did not add runtime JavaScript.
- Runtime JavaScript coverage for the stacked migration was generated by the targeted Playwright lanes in PR_170 and PR_171; missing server-side Node coverage remains advisory WARN by project policy.

## Required Artifacts

- `docs_build/dev/reports/PR_26166_172-dev-db-migration-closeout-audit_report.md`
- `docs_build/dev/reports/PR_26166_172-dev-db-migration-closeout-audit_cleanup_report.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `tmp/PR_26166_172-dev-db-migration-closeout-audit_delta.zip`
