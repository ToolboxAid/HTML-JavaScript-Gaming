# PR_26164_109-final-db-migration-audit

## Branch Validation

- PASS: Current branch is `main`.
- PASS: Expected branch is `main`.

## Scope

- PASS: Final DB migration audit/reporting completed.
- PASS: No new features were added.
- PASS: Tiny audit fixes were limited to removing active static non-user key ownership from runtime seed/repository paths and one static project id from an Objects Playwright fixture.

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Re-run full active DB consumer audit | PASS | `docs_build/dev/reports/db-consumer-audit-final.md` and `.csv` generated. Audit rows: 104. Needs migration: 0. |
| Confirm DDL completeness | PASS | 15 grouped DDL files audited; every file has executable `CREATE TABLE` DDL or a justified empty-group note. |
| Confirm DML completeness | PASS | 15 grouped DML files audited; every file has executable DEV/review DML or a justified setup/empty note. |
| Confirm seed grouping completeness | PASS | `docs_build/database/seed/account.json` plus 33 grouped guest seed files under `docs_build/database/seed/guest/`. |
| Confirm server-side seed API ownership | PASS | `src/dev-runtime/seed/server-seed-loader.mjs` owns seed loading and server-generated non-user keys. |
| Confirm guest seed data ownership | PASS | Guest seed files are read-only with `writableByGuest: false` and `signInRedirect: account/sign-in.html`. |
| Confirm no active MEM DB | PASS | Active route/mode is Local DB. `local-mem` remains only in negative tests. |
| Confirm no `/login.html` | PASS | `/login.html` remains only in negative test assertions. |
| Confirm no fake-login | PASS | No active `fake-login` hits in account, assets, database, src, tests, or toolbox scan. |
| Confirm no custom password storage | PASS | No password storage tables were added. Password hits are sign-in/lost-password UI, comments, and negative tests. |
| Confirm no browser authoritative key generation | PASS | Browser key SSoT removed from active seed path. Non-user seed/runtime keys are generated in server/dev-runtime code. |
| Confirm no browser storage product-data SSoT | PASS | Final audit has no `Needs migration` browser-storage product-data blockers. Remaining storage hits are engine utilities/future boundary review. |
| Confirm static ULID exception is limited | PASS | Static record keys are limited to DEV users and required `user_roles`; guest seed audit fields reference DavidQ admin. |
| Confirm all other records use server/API-generated ULIDs | PASS | Runtime seed/router/repository paths use `randomBytes`-backed ULID-style generation. Static project fixture was removed from `ObjectsTool.spec.mjs`. |
| Confirm Admin DB Viewer grouping buttons sorted | PASS | Playwright validates order: All, Asset, Controls, Game Configuration, Game Design, Game Journey, Game Workspace, Objects, Palette, Tags, Tool Metadata, Tool Planning, Tool State Samples, Toolbox Votes, User Roles. |
| Confirm user seed plan | PASS | Seed users are User 1, User 2, User 3, and DavidQ admin. |
| Produce final next PR list | PASS | Supabase/external-auth follow-up list included below. |
| Required review artifacts | PASS | `codex_review.diff` and `codex_changed_files.txt` regenerated after final edits. |
| Required ZIP | PASS | `tmp/PR_26164_109-final-db-migration-audit_delta.zip`. |

## Final Audit Summary

- PASS: `db-consumer-audit-final.csv` row count: 104.
- PASS: `Needs migration`: 0.
- REVIEW: `Needs review`: 25. These are compatibility wrappers, dev-runtime owners, engine storage utilities, or future boundary/naming follow-ups. They are not Local DB migration blockers.
- PASS: `OK Local DB`: 50.
- PASS: `Out of scope`: 29.

## Search Evidence

### Retired Route/Mode Terms

- PASS: `fake-login`: no active hits.
- PASS: `authProvider: mock`: no active hits.
- PASS: `local-mem`: only negative tests:
  - `tests/dev-runtime/DbSeedIntegrity.test.mjs`
  - `tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`
  - `tests/playwright/tools/LoginSessionMode.spec.mjs`
  - `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs`
- PASS: `/login.html`: only negative test coverage in `tests/playwright/tools/LoginSessionMode.spec.mjs`.

### Password Storage

- PASS: No password storage tables exist.
- PASS: Search hits are expected UI or negative/governance coverage only:
  - `account/sign-in.html`
  - `account/lost-password.html`
  - `assets/theme-v2/js/gamefoundry-partials.js`
  - `docs_build/database/ddl/account.sql`
  - `docs_build/database/dml/account.sql`
  - `docs_build/database/seed/account.json`
  - login/static route tests

### Static ULIDs

- PASS: Approved DEV user keys:
  - `01K2GFSJ0Y0000000000000051`
  - `01K2GFSJ0Y0000000000000052`
  - `01K2GFSJ0Y0000000000000053`
  - `01K2GFSJ0Y0000000000000054`
- PASS: Approved user-role keys:
  - `01K2GFSJ0Y0000000000000082`
  - `01K2GFSJ0Y0000000000000083`
  - `01K2GFSJ0Y0000000000000084`
  - `01K2GFSJ0Y0000000000000085`
  - `01K2GFSJ0Y0000000000000086`
- PASS: Static admin key usage in guest seed `createdBy` is an audit-field reference to DavidQ admin, not a non-user record key.
- PASS: `0123456789ABCDEFGHJKMNPQRSTVWXYZ` appears only as a ULID alphabet constant for runtime key generation.
- PASS: Old hardcoded non-user project id fixture was removed from `tests/playwright/tools/ObjectsTool.spec.mjs`.

## Tiny Audit Fixes

- `src/dev-runtime/server/mock-api-router.mjs`
  - Removed fixed game workspace/toolbox-vote/tool metadata/tool planning static non-user keys.
  - Added runtime ULID-style key generation for those server/dev-runtime records.
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
  - Replaced fixed project storage ids with runtime-generated ULID-style storage keys.
- `tests/playwright/tools/ObjectsTool.spec.mjs`
  - Replaced a hardcoded project id in a sprite fixture path with a path derived from the existing asset record.

## User Seed Plan

- PASS: DEV users are static for local PowerShell/API sign-in compatibility only:
  - User 1
  - User 2
  - User 3
  - DavidQ admin
- PASS: `authProvider` is `dev-static-seed` for these DEV records.
- PASS: `authProvider: mock` is not used.
- PASS: Passwords are not stored in app tables.

## Remaining Follow-Up List

These are recommended after Local DB migration is complete:

1. Choose and wire external auth provider for production-style account credential flows.
2. Replace Create Account and Lost Password placeholders with provider-backed flows.
3. Add production session/cookie/CSRF contract around the external auth provider.
4. Map external identities to Local DB/user role records through server APIs only.
5. Add production migration runner and environment-specific DB configuration.
6. Remove or hard-gate DEV static seed users and PowerShell sign-in helpers outside DEV.
7. Resolve remaining `Needs review` audit items as focused boundary/naming PRs.

## Validation Performed

- PASS: `git diff --check`
  - Output had only Windows LF/CRLF checkout warnings.
- PASS: `node --check src/dev-runtime/server/mock-api-router.mjs`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS: `node --check src/dev-runtime/seed/server-seed-loader.mjs`
- PASS: `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS: `node --check src/dev-runtime/guest-seeds/tool-state-samples.js`
- PASS: `node --check toolbox/game-journey/game-journey.js`
- PASS: `node --check tests/playwright/tools/ObjectsTool.spec.mjs`
- PASS: `node --test tests/dev-runtime/DevRuntimeBoundary.test.mjs tests/dev-runtime/DbSeedIntegrity.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --reporter=line`
  - 7 passed.
- PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --reporter=line`
  - 15 passed.
- PASS: `npx playwright test tests/playwright/tools/RootToolsFutureState.spec.mjs tests/playwright/tools/LoginSessionMode.spec.mjs --reporter=line`
  - 14 passed.
- PASS: `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs -g "Sprite asset" --reporter=line`
  - 1 passed.
- PASS: `npm run test:workspace-v2`
  - 5 passed. Command name is legacy; it runs the active workspace-contract validation lane.

## Playwright Result

- PASS: Admin DB Viewer validates Local DB table grouping, users, roles, diagnostics, and audit normalization.
- PASS: Asset tool validates Local DB-backed repository behavior, upload/delete safety, and UTF-8 review diff guard.
- PASS: Sign-in/account lane validates production-safe sign-in copy, admin setup API, Local users, logout, and guest redirect behavior.
- PASS: Root tools lane validates active toolbox navigation/registry surfaces.
- PASS: Objects targeted lane validates the hardcoded project id fixture removal without breaking sprite asset linking.

## V8 Coverage

- WARN: `docs_build/dev/reports/playwright_v8_coverage_report.txt` exists and lists changed runtime JavaScript files.
- WARN: Server/dev-runtime Node modules are not collected by browser V8 coverage and are reported as advisory warnings.
- PASS: Browser runtime coverage collection still exercised Theme V2/tool entry points where applicable.

## Impacted Lanes

- runtime: Local DB/dev-runtime seed loader, mock API router, mock DB store, asset repository.
- contract: DDL/DML/seed ownership and DB consumer audit artifacts.
- admin/account: Admin DB Viewer and sign-in/session behavior.
- toolbox: guest seed/toolbox registry and Objects sprite fixture coverage.

## Skipped Lanes

- samples: SKIP. Samples were not in scope and project instructions say samples remain out of scope until a sample-alignment PR.
- engine: SKIP. No engine runtime behavior changed.
- full samples smoke: SKIP. Not requested and no sample JSON/runtime sample path was changed.

## Manual Validation Steps

1. Open `account/sign-in.html` and confirm public sign-in has no reseed/status/setup controls.
2. Open Admin DB Viewer and confirm the group buttons match the sorted order listed above.
3. Confirm Local DB seed users are User 1, User 2, User 3, and DavidQ admin.
4. Confirm guest tool save actions redirect to `account/sign-in.html`.
5. Confirm `docs_build/dev/reports/db-consumer-audit-final.md` has no active migration blockers.

