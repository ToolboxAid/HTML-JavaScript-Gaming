# PR_26161_011 Objects DB Persistence Fix Report

## Branch Guard
- Current branch: `main`
- Expected branch: `main`
- Local branches found: `* main`
- Branch validation: PASS

## Source Of Truth
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Used the user-provided `PR_26161_011-objects-db-persistence-fix` request as the active BUILD source.
- PASS: Continued from `PR_26161_010`.
- PASS: Kept the PR purpose singular: persist Objects table rows through the shared DB/mock adapter.

## Requirement Checklist
- PASS: Added/edited/deleted object rows persist through the shared Objects repository exposed by the shared server API/mock adapter.
- PASS: Object definitions are no longer stored only in page-local memory; the page uses `draftedObjects` as a render cache loaded from and saved to the shared adapter.
- PASS: Page load reads existing object records from the shared adapter.
- PASS: Add/Edit/Delete/Reset writes the updated object record list to the shared adapter.
- PASS: Sprite render asset links persist with each object record through `renderAssetKey` and `renderPreviewPath`.
- PASS: Returning to or reloading the Objects page shows previously saved rows.
- PASS: Asset remains linked render-record display data, not an invalid free-text user field.
- PASS: `State` remains visible in the Objects table.
- PASS: Preserved Object Type Catalog compact display with `Template` and `Capability` only.
- PASS: Preserved table-first input, `Add Object` below the table, Add disabled while adding, Cancel, Edit, Trash, Reset Table, Object Status, and Sprite asset linking.
- PASS: Did not add sample JSON alignment, auth behavior, production DB behavior, or unrelated tool rewrites.
- PASS: Kept Theme V2 only and preserved HTML restrictions.
- PASS: No runtime engine behavior changed.

## Implementation Evidence
- `src/dev-runtime/persistence/tool-repositories/objects-mock-repository.js`: added an Objects repository with `listObjects`, `replaceObjects`, `resetObjects`, `getTables`, and `getSnapshot`.
- `src/dev-runtime/persistence/mock-db-store.js`: added the Objects table group and `object_definition_records` schema.
- `src/dev-runtime/server/mock-api-router.mjs`: exposed the Objects repository and table snapshot through the existing toolbox server API.
- `toolbox/objects/objects-api-client.js`: added the Objects API client for the browser tool.
- `toolbox/objects/objects.js`: loads Objects rows from the repository on page load and persists rows after Add/Edit/Delete/Reset while preserving linked sprite asset display.
- `tests/playwright/tools/ObjectsTool.spec.mjs`: added reload persistence checks for add, edit, delete, and sprite asset links.

## Impacted Lane
- Impacted lane: Objects tool UI/runtime plus shared mock DB adapter contract for the Objects table.
- Playwright impacted: Yes.
- Changed runtime JavaScript: `toolbox/objects/objects.js`, `toolbox/objects/objects-api-client.js`, `src/dev-runtime/server/mock-api-router.mjs`, `src/dev-runtime/persistence/mock-db-store.js`, `src/dev-runtime/persistence/tool-repositories/objects-mock-repository.js`.

## Testing Performed
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/objects-mock-repository.js`
- PASS: `node --check toolbox/objects/objects-api-client.js`
- PASS: `node --check toolbox/objects/objects.js`
- PASS: `node --check tests/playwright/tools/ObjectsTool.spec.mjs`
- PASS: `node --check src/dev-runtime/server/mock-api-router.mjs`
- PASS: `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS: HTML restriction check for `toolbox/objects/index.html` returned no inline script/style/event handler matches.
- PASS: Objects forbidden wording scan returned no matches in `toolbox/objects/index.html` or `toolbox/objects/objects.js`.
- PASS: `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs --workers=1 --reporter=line` (6 passed).
- PASS: `git diff --check` exited 0 with line-ending warnings only.
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` was produced by targeted Objects Playwright.

## Playwright Behavior Coverage
- PASS: Add row persists to `object_definition_records` and remains visible after page reload.
- PASS: Edit row persists to `object_definition_records` and remains visible after page reload.
- PASS: Delete row removes the shared DB record and remains removed after page reload.
- PASS: Sprite render creates/resolves a linked shared asset and persists its key on the object record.
- PASS: Reloading Objects restores the linked sprite asset display and `Edit Sprite` action.
- PASS: Existing Objects UI checks still cover Type/Capabilities wording, compact catalog, table-first editing, Object Status actions, and Sprite linking.

## Skipped Lanes
- `npm run test:workspace-v2`: SKIP. The script maps to the legacy workspace-contract lane and does not cover Objects tool UI/runtime behavior.
- Full samples validation: SKIP. Safe because no sample JSON, sample launch path, or sample runtime behavior changed.
- Engine runtime validation beyond changed-file syntax/import checks: SKIP. Safe because no engine runtime behavior changed.
- Production DB/auth validation: SKIP. Safe because the change is limited to the shared dev mock adapter and Objects tool.
- Broad Toolbox/Admin validation: SKIP. Safe because navigation, registration, auth, admin surfaces, and sample paths were not changed.

## Manual Validation Steps
- Open `/toolbox/objects/index.html`.
- Add a non-Sprite object, reload the page, and confirm the row remains.
- Edit the saved row, reload the page, and confirm the edited name/state remain.
- Delete the row, reload the page, and confirm the table is empty.
- Add a Sprite object, save it, reload the page, and confirm the Render Asset display and `Edit Sprite` link still point to the linked sprite asset.
- Click `Reset Table`, reload the page, and confirm the shared object records remain cleared.
- Confirm Object Type Catalog still shows only `Template` and `Capability`, and the Objects table still shows `State`.

## Required Artifacts
- PASS: `docs_build/dev/reports/objects-db-persistence-fix-report.md`
- PASS: `docs_build/dev/reports/codex_review.diff`
- PASS: `docs_build/dev/reports/codex_changed_files.txt`
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS: `tmp/PR_26161_011-objects-db-persistence-fix_delta.zip`
