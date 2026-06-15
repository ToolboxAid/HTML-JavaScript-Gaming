# PR_26166_145-supabase-users-roles-cutover

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before changes.
- PASS: Browser continues to use backend API routes only; no browser Supabase/local-db switching was added.
- PASS: Identity ownership is explicit in the provider contract for `users`, `roles`, and `user_roles` through `identityOwnership`.
- PASS: Supabase Auth selected path reads identity rows server-side while `GAMEFOUNDRY_DB_PROVIDER=local-db` keeps product data on Local DB.
- PASS: No games/assets/objects/controls/palettes/tags/workspace/tool metadata/product tables were migrated.
- PASS: DEV static ULID exception remains documented for User 1, User 2, User 3, and DavidQ admin only.
- PASS: Ownership fields are declared for identity records: `key`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.
- PASS: `users.key` remains the authoritative ownership reference.
- PASS: No browser-generated authoritative keys were added.
- PASS: No password tables or local password storage were added.
- PASS: No secrets or `.env` files were added.
- PASS: No silent fallback was added; selected providers are authoritative and missing identity/role rows fail visibly.

## Implementation Summary
- `src/dev-runtime/auth/provider-contract-stubs.mjs`: added `identityOwnership` contract fields describing auth-owned identity tables, owner provider, reader provider, product DB provider, ownership fields, static DEV user exception, and no browser-owned keys.
- `src/dev-runtime/server/local-api-router.mjs`: added provider-aware async session helpers for Supabase Auth selected with Local DB product data; session routes now resolve identity through server-side Supabase identity table reads.
- `tests/dev-runtime/SupabaseProviderContractStub.test.mjs`: added coverage for identity ownership contract, Supabase selected identity lookup, role lookup, user_roles lookup, missing-user diagnostics, and missing-role diagnostics.

## Validation Lane Report
- PASS: changed-file syntax checks:
  - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
  - `node --check src/dev-runtime/server/local-api-router.mjs`
  - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: targeted auth identity validation:
  - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
  - Result: 21 passed.
- PASS: Supabase selected path with Local DB product data:
  - Test env used `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth` and `GAMEFOUNDRY_DB_PROVIDER=local-db` against a fake Supabase service.
  - Validated `users`, `roles`, and `user_roles` REST reads through server-side provider contract.
- PASS: missing-user visible failure:
  - `POST /api/session/user` with a missing user key returns an unauthenticated session with actionable diagnostic.
- PASS: missing-role visible failure:
  - `POST /api/session/user` with `user_roles.roleKey` pointing to a missing role returns an unauthenticated session with actionable diagnostic.
- PASS: workspace-v2 validation:
  - `npm run test:workspace-v2`
  - Result: 5 Playwright tests passed.
- PASS: diff guardrail:
  - `git diff --check`
  - Result: no whitespace errors; line-ending warnings only.

## Playwright / V8 Coverage
- Playwright impacted: Yes.
- PASS: `npm run test:workspace-v2` passed.
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` generated for changed runtime JavaScript files using targeted Node V8 coverage from auth identity tests.

## Impacted Lanes
- Auth/session provider contract lane.
- Local API session route lane.
- Workspace-v2 Playwright validation lane because runtime auth/session behavior changed.

## Skipped Lanes
- Samples smoke: SKIP. This PR changes auth/session provider contracts only and does not alter sample runtime behavior.
- Full product DB migration validation: SKIP. Requirement explicitly keeps non-auth product data on Local DB and forbids product table migration.

## Manual Validation Notes
- Start dev server with `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth` and `GAMEFOUNDRY_DB_PROVIDER=local-db`.
- Ensure Supabase URL, anon key, and service-role key are present in local environment only.
- Call `/api/providers/contract` and verify `identityOwnership.ownerProviderId=supabase-auth`, `readerProviderId=supabase-postgres`, and `productDatabaseProviderId=local-db`.
- Call `/api/session/users` and verify identity users resolve through server API.
- Call `/api/session/user` with a valid seeded DEV user key and verify role slugs resolve from `user_roles` and `roles`.
- Call `/api/local-db/snapshot` and verify product tables remain Local DB-backed.

## Changed Files
See `docs_build/dev/reports/codex_changed_files.txt` for the generated changed-file list.
