# PR_26164_098 Toolbox Local DB Migration

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.
- Stack: PR_26164_097 admin/account Local DB migration is present in the working tree.
- Scope: Toolbox and directly related active tool DB/data consumers.
- Supabase introduced: PASS, no.
- MEM DB reintroduced: PASS, no.
- `/login.html` introduced: PASS, no.
- Fake-login introduced: PASS, no.
- Custom password storage tables introduced: PASS, no.
- Samples migrated: PASS, no.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified branch `main` before continuing PR098.
- PASS: Started from PR096 DB consumer audit and remaining active consumers after PR097.
- PASS: Kept runtime implementation changes scoped to active Toolbox Local DB consumers.
- PASS: Did not change Admin/Account pages except stacked PR097 work already present.
- PASS: Active Objects repository now writes `object_definition_records.gameId`, matching the active Local DB schema.
- PASS: Objects repository preserves read compatibility for older `projectId` rows while writing the schema-owned `gameId` field.
- PASS: Objects add/edit/delete/reset persistence through the shared server repository passes targeted Playwright.
- PASS: Objects Sprite render asset linking passes targeted Playwright.
- PASS: Assets repository can resolve the active Game Workspace seed game to the canonical storage ULID when Objects deliberately creates a sprite asset link.
- PASS: Asset upload/page-load lazy project behavior was not changed; this only repairs explicit sprite-link creation and legacy import action paths.
- PASS: Toolbox metadata/order/votes active browser consumers continue using `/api/toolbox/registry/snapshot` and `/api/toolbox/votes/*`.
- PASS: Workspace-v2 representative active tool test now reads the Local DB-backed registry API instead of importing `toolbox/toolRegistry.js`.
- PASS: Game Journey guest navigation validation now asserts current `Sign In` wording and verifies it does not use `/login.html`.
- PASS: Missing Local DB/API configuration still fails through existing server API diagnostics; no silent MEM fallback added.
- PASS: Browser storage was not added as a product-data source of truth.
- PASS: Unresolved migration/review items are documented below as FOLLOW-UP REQUIRED.

## Toolbox Migration Audit

### Assets

- PASS: Active Assets page and repository use server repository/client flow: browser -> server API -> Local DB-backed repository.
- PASS: Targeted Assets Playwright passed, including asset catalog, upload/write, delete-file, duplicate guard, guest block, owner scope, and UTF-8 diff artifact check.
- PASS: Sprite asset creation for Objects now receives `gameWorkspaceRepository` and resolves seed game ids to canonical Local DB storage ids.
- FOLLOW-UP REQUIRED: `toolbox/assets/assets-upload-worker.js` remains a file-processing worker and should receive a separate data-boundary review if upload-worker ownership expands beyond transfer/progress processing.

### Objects

- PASS: `src/dev-runtime/persistence/tool-repositories/objects-mock-repository.js` now writes `gameId`, not stripped `projectId`, into `object_definition_records`.
- PASS: Read-side compatibility keeps `record.gameId || record.projectId` so older in-flight rows still resolve.
- PASS: Targeted Objects Playwright passed after the migration fix.
- FOLLOW-UP REQUIRED: `toolbox/objects/objects.js` still owns the Object Type Catalog/template list locally. This is UI/config seed data, not row persistence, but should move to a declared registry/config source in a future PR.

### Controls

- PASS: Controls uses `toolbox/controls/controls-api-client.js` and server repository flow.
- PASS: Targeted Controls/Input Mapping Playwright passed in the priority tool lane.
- PASS: No physical input/controller persistence ownership was moved in this PR.

### Colors

- PASS: Colors page uses `toolbox/colors/palette-api-client.js` and Local DB-backed palette repository.
- PASS: Targeted DB-focused Colors/Palette validation passed:
  - `Palette repository owns project swatches and protects invalid payloads`
  - `Colors rejects invalid payloads before render and blocks editing without an active project`
- FOLLOW-UP REQUIRED: `toolbox/colors/colors.js` keeps page-local editor/generator UI state. This appears transient, but palette catalog/source config should be reviewed separately if it becomes product data.
- Note: A non-gating broad Palette spec run still has inherited visual/test debt unrelated to this PR: stale old Project expectation, swatch row alignment assertion, and a missing `forge-bot-single.png` request in an admin controls case.

### Tags

- PASS: Tags uses `toolbox/tags/tags-api-client.js` and Local DB-backed repository.
- PASS: Targeted Tags Playwright passed for shared workspace tag table, add/edit/delete, usage expansion, and toolbox registration.

### Game Journey

- PASS: Game Journey uses `toolbox/game-journey/game-journey-api-client.js` and Local DB-backed repository.
- PASS: Targeted Game Journey validation passed for the previously failing guest/sign-in and ownership/template cases.
- PASS: Full Game Journey run showed 11/13 passing before the sign-in test update; the two affected cases passed after targeted rerun.
- FOLLOW-UP REQUIRED: PR096 listed Game Journey as "Local DB plus static registry import." Active browser Game Journey code now reads suggested tools through the API client path; static seed registry remains in dev-runtime/tool metadata.

### Tool Metadata, Order, Votes

- PASS: Active Toolbox page consumers use `toolbox/tool-registry-api-client.js`, `src/engine/api/toolbox-votes-api-client.js`, and API routes.
- PASS: `tests/playwright/tools/RootToolsFutureState.spec.mjs` no longer imports `toolbox/toolRegistry.js`; it fetches `/api/toolbox/registry/snapshot`.
- PASS: `tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs` confirms active pages do not request `/toolbox/toolRegistry.js`.
- FOLLOW-UP REQUIRED: `toolbox/toolRegistry.js` remains as a compatibility/test helper that re-exports dev-runtime seed metadata. Active browser navigation does not request it, but several non-workspace tests still import it and should be migrated to an API-backed fixture or scoped dev-runtime helper.

## Remaining DB Consumer Follow-Up List

- FOLLOW-UP REQUIRED: `toolbox/toolRegistry.js` compatibility/test helper still exists; active browser pages avoid it, but test-only imports remain.
- FOLLOW-UP REQUIRED: `src/dev-runtime/guest-seeds/tool-metadata-inventory.js` remains the bootstrap/seed source for active tool metadata until Site Setup owns controlled setup/seed behavior.
- FOLLOW-UP REQUIRED: `src/dev-runtime/guest-seeds/tool-state-samples.js` remains seed/sample fixture data and is not migrated in this PR.
- FOLLOW-UP REQUIRED: `src/dev-runtime/guest-seeds/palette-source-mock-db.js` remains seed/source data and needs a separate source-review PR.
- FOLLOW-UP REQUIRED: `src/dev-runtime/persistence/tool-repositories/palette-catalog-config.js` remains static catalog configuration; no product-row persistence change made here.
- FOLLOW-UP REQUIRED: Legacy `mock-db` route/client names remain compatibility naming around the active Local DB-backed adapter.
- FOLLOW-UP REQUIRED: Runtime SQLite schema creation in `src/dev-runtime/server/mock-api-router.mjs` remains from prior architecture and should be reviewed against DDL artifact ownership separately.

## MEM DB Reintroduction Audit

- PASS: No active MEM DB runtime route or implementation was introduced.
- PASS: `local-mem` search in changed active scope found only an existing test assertion that the retired `local-mem` mode is absent.
- PASS: No fake-login references were introduced.
- PASS: No `/login.html` references were introduced.

## Sign-In Route Audit

- PASS: Game Journey guest navigation now expects `Sign In`.
- PASS: Added assertion that the account nav link does not point to `/login.html`.
- PASS: Existing Account/Admin Local DB pages from PR097 continue to use current sign-in/session API patterns.

## Validation Lane Report

- Impacted lane: Toolbox Local DB runtime/metadata lane.
- Playwright impacted: Yes.
- Runtime JavaScript changed: Yes.
- Samples validation: SKIP. Request explicitly says do not migrate samples; no sample runtime files changed.
- `npm run test:workspace-v2`: PASS. Command name is legacy; user-facing workspace terminology remains current in active UI.
- Changed-file syntax checks: PASS.
- `git diff --check`: PASS after sanitizing generated `codex_review.diff`; artifact is verified UTF-8 readable.
- V8 coverage: WARN/PASS. Browser V8 coverage report exists. Server-side changed JS is exercised by Playwright but not collected by browser V8 and is reported as WARN in `playwright_v8_coverage_report.txt`.

### Playwright Performed

- PASS: `npx playwright test tests/playwright/tools/RootToolsFutureState.spec.mjs --workers=1 --reporter=list`
- PASS: `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs --workers=1 --reporter=list`
- PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --workers=1 --reporter=list`
- PASS: `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs --workers=1 --reporter=list`
- PASS: Controls/Input Mapping priority lane passed as part of `InputMappingV2Tool.spec.mjs` run.
- PASS: `npx playwright test tests/playwright/tools/TagsTool.spec.mjs --workers=1 --reporter=list`
- PASS: `npx playwright test tests/playwright/tools/GameJourneyTool.spec.mjs --workers=1 --reporter=list --grep "Guest as the selected|item ownership"`
- PASS: `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs --workers=1 --reporter=list --grep "Palette repository owns|Colors rejects"`
- PASS: `npm run test:workspace-v2`

## Manual Validation Notes

- Open `/toolbox/index.html`; active tool registry renders through the API-backed registry snapshot.
- Open `/toolbox/objects/index.html`; add a non-sprite object and reload; the row remains visible.
- Open `/toolbox/objects/index.html`; add a Sprite-render object; the shared sprite asset link is created and the row persists.
- Open `/toolbox/assets/index.html`; existing upload validation remains unchanged by the sprite-link fallback.
- Open `/toolbox/game-journey/index.html?game=demo-game` as Guest; account nav says `Sign In` and does not use `/login.html`.

## Changed Files

PR098-specific implementation and tests:

- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `src/dev-runtime/persistence/tool-repositories/objects-mock-repository.js`
- `src/dev-runtime/server/mock-api-router.mjs`
- `tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `tests/playwright/tools/GameJourneyTool.spec.mjs`
- `docs_build/dev/reports/pr098-toolbox-local-db-migration.md`

Stacked PR097 files remain in the working tree and are included in generated review artifacts because this PR is stacked on PR097.

## Required Outputs

- PASS: `docs_build/dev/reports/pr098-toolbox-local-db-migration.md`
- PASS: `docs_build/dev/reports/codex_review.diff`
- PASS: `docs_build/dev/reports/codex_changed_files.txt`
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS: repo-structured ZIP under `tmp/PR_26164_098-toolbox-local-db-migration_delta.zip`
