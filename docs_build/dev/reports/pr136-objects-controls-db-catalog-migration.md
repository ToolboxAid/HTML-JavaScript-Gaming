# PR_26166_136 Objects/Controls DB Catalog Migration

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.

## Scope

- PASS: Stayed in the DB/Auth migration lane.
- PASS: Scoped implementation to active Objects and Controls catalog ownership plus targeted tests/reports.
- PASS: Did not activate Supabase.
- PASS: Did not reintroduce MEM DB, `local-mem`, fake-login, or `login.html`.
- PASS: Did not use browser storage as product-data SSoT.

## Objects/Controls Product-Data Audit

| Area | Before | After | Status |
| --- | --- | --- | --- |
| Objects capability labels | `toolbox/objects/objects.js` owned `CAPABILITY_LABELS`. | `src/dev-runtime/persistence/tool-repositories/objects-mock-repository.js` owns labels; `/api/toolbox/objects/constants` serves them; `objects-api-client.js` imports them for the page. | PASS |
| Objects type templates | `toolbox/objects/objects.js` owned `OBJECT_TYPE_TEMPLATES`. | Server repository owns templates; page reads them through the Local API constants contract. | PASS |
| Objects starter objects | `toolbox/objects/objects.js` owned `STARTER_OBJECTS`. | Server repository owns starter catalog; page seeds from API-returned constants. | PASS |
| Controls event options | `toolbox/controls/controls.js` owned `CONTROL_EVENT_OPTIONS`. | Server repository owns event option catalog; page reads it through `controls-api-client.js`. | PASS |
| Controls normalized game inputs | `toolbox/controls/controls.js` owned `GAME_CONTROL_NORMALIZED_INPUTS`. | Server repository owns active game-control input list; engine registry still owns normalization mechanics. | PASS |
| Controls usage/default/engine-owned catalogs | Browser owned usage labels, common defaults, and engine-owned input list. | Server repository owns catalog payload; page derives Sets from API-returned arrays only. | PASS |

## Local API / DB Contract Evidence

- PASS: `GET /api/toolbox/objects/constants` returns `OBJECTS_TOOL_TABLES`, `CAPABILITY_LABELS`, `OBJECT_TYPE_TEMPLATES`, and `STARTER_OBJECTS`.
- PASS: `GET /api/toolbox/controls/constants` returns `INPUT_MAPPING_TOOL_TABLES`, `CONTROL_EVENT_OPTIONS`, `GAME_CONTROL_NORMALIZED_INPUTS`, `NORMALIZED_USAGE_LABELS`, `COMMON_DEFAULT_GAME_CONTROLS`, and `ENGINE_OWNED_NORMALIZED_INPUTS`.
- PASS: Direct Local API smoke reported `provider=local-db/local-db objectTypes=Collectible,Custom,Decoration,Enemy,Goal,Hazard,Hero,Platform,Projectile,Spawn Point,Wall controlInputs=17 objectTable=true controlTable=true`.
- PASS: DB Viewer targeted Playwright validation passed and showed the Local DB-backed active tables, including `object_definition_records` and `game_input_mappings`.
- NOTE: No new catalog DDL tables were added. Persisted creator records remain in existing Local DB tables; static product catalogs moved from browser ownership to the existing server constants contract.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified current branch is `main`.
- PASS: Started from PR129/PR134 browser-owned product-data warnings.
- PASS: Moved active Objects product-data catalogs behind Local API/server contract.
- PASS: Moved active Controls product-data catalogs behind Local API/server contract.
- PASS: Removed active page-local product-data catalog ownership from Objects and Controls browser modules.
- PASS: Kept UI labels/static copy where non-product data.
- PASS: Missing DB/API config remains visibly blocked through `readServerToolConstants`, `requireServerConstant`, and existing repository diagnostic paths.
- PASS: DB Viewer shows Local DB-backed state.
- PASS: Playwright impacted and targeted affected tests were run.
- PASS: Runtime JavaScript changed and Playwright V8 coverage report was produced.
- PASS: Full samples smoke skipped because samples were outside this DB/Auth catalog migration scope.

## Validation Lane Report

- Impacted lane: toolbox runtime plus Local API DB contract and Admin DB Viewer evidence.
- PASS: `node --check` for changed JS/MJS files:
  - `toolbox/objects/objects.js`
  - `toolbox/objects/objects-api-client.js`
  - `toolbox/controls/controls.js`
  - `toolbox/controls/controls-api-client.js`
  - `src/dev-runtime/persistence/tool-repositories/objects-mock-repository.js`
  - `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
  - `src/dev-runtime/server/local-api-router.mjs`
  - `tests/playwright/tools/ObjectsTool.spec.mjs`
  - `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
  - `tests/playwright/tools/AdminDbViewer.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs -g "Objects exposes production copy"` passed.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs -g "Toolbox Controls shows game controls only"` passed.
- PASS: `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs -g "Admin DB Viewer shows current read-only Local DB tables"` passed 2/2.
- PASS: Combined final coverage harness visited Objects and Controls and refreshed `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- PASS/WARN: Browser runtime coverage includes:
  - `(30%) toolbox/objects/objects.js`
  - `(66%) toolbox/controls/controls.js`
  - `(100%) toolbox/objects/objects-api-client.js`
  - `(100%) toolbox/controls/controls-api-client.js`
  - Node-side dev-runtime modules are reported as WARN by browser V8 coverage and covered by syntax checks plus route smoke.
- PASS: `git diff --check`.
- SKIP: Full samples smoke; samples are outside this PR scope.

## Manual Validation Notes

- PASS: Objects page renders the Object Type Catalog from server-returned constants.
- PASS: Controls page renders 17 Game Control rows from server-returned constants.
- PASS: Active browser modules no longer declare the audited product catalog constants locally.
- PASS: `npm run dev:local-api` start was validated through captured server log at `tmp/pr136-local-api-clean.log`; direct route smoke was completed through the Local API server module with disposable SQLite.
- WARN: Two attempted direct npm smoke harnesses produced cleanup/tooling issues after successful server start evidence; the successful route smoke used the same Local API server module and isolated database.
- Required ZIP: `tmp/PR_26166_136-objects-controls-db-catalog-migration_delta.zip`.
