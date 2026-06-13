# PR_26163_071-tags-assets-completion-fixes

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Impacted Lanes
- Toolbox runtime lane: Tags and Assets tool surfaces.
- Integration lane: Toolbox registry/menu/tile image metadata.
- Mock DB adapter lane: Tags/Assets repository table shape and ownership/audit fields.
- Playwright impacted: Yes.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS: `toolbox/tags/index.html` now places `Add Tag` under the Tags table. Evidence: `TagsTool.spec.mjs` asserts `[data-tags-add]` is inside the Tags table card and not inside an aside.
- PASS: Tags columns remain `Tag Name`, `Description`, `Usage Count`, `Actions`.
- PASS: Tags nested usage table still renders `Tool` and `Item Name`. Evidence: `TagsTool.spec.mjs` validates the expanded usage row.
- PASS: Tags registration is complete for active surfaces. Evidence: `/api/toolbox/registry/snapshot` returns Tags with `route: toolbox/tags/index.html`, `visibleInToolsList: true`, and `/toolbox/index.html` renders the Tags tile.
- PASS: `toolbox/workspace-manager-v2/index.html` registration is N/A in this checkout. Evidence: `Test-Path toolbox/workspace-manager-v2/index.html` returned `False`; `rg --files toolbox | rg "workspace-manager-v2/index.html"` returned no matches.
- PASS: Tags visual identity no longer reuses Assets artwork. Evidence: Tags registry and page now use `assets/theme-v2/images/badges/tags.png` and `assets/theme-v2/images/tools/tags.png`; tests assert neither path is an Assets image.
- PASS: Assets active MVP asset types are only `Images`, `Audio`, `Fonts`, `Sprites`, `Vectors`, `Palette References`, `Data`.
- PASS: Upload-based asset tables show `Source`, `File`, `Usage`, `Tags`, `Preview`, `Actions`.
- PASS: Reference-based asset tables show `Reference`, `Usage`, `Tags`, `Preview`, `Actions`.
- PASS: Legacy active asset roles `Color`, `Localization`, `Shader`, and `Video` are absent from active Assets runtime behavior. Search evidence: `rg -n "Projectile|\\bColor\\b|Localization|Shader|Video" toolbox/assets src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js src/dev-runtime/persistence/mock-db-store.js toolbox/assets/assets.js` returned no matches.
- PASS: Active usage dropdown values are limited to `Background`, `Character`, `Enemy`, `Environment`, `Font`, `Icon`, `Interface`, `Music`, `Sound Effect`, `Sprite`, `Theme`, `Tile`, `Voice`.
- PASS: `Projectile` is absent from active Assets usage dropdowns. Evidence: Playwright asserts usage options exactly match the requested list and do not contain `Projectile`.
- PASS: Asset tag fields use shared workspace Tags type-ahead. Evidence: Playwright creates a shared Tags record, uses the Assets `Asset Tags` type-ahead/list field, adds the shared tag token, and validates usage count references.
- PASS: Ownership/audit fields are present. Evidence: repository tests assert populated Tags/Assets rows include `key`, `createdAt`, `updatedAt`, `createdBy`, and `updatedBy`.
- PASS: User-owned Assets records remain owner-scoped. Evidence: Playwright adds an asset as user1, switches to user2 and confirms it is hidden, then switches back to user1 and confirms it remains editable/deletable.
- PASS: No archive runtime code is used. Evidence: Tags/Assets Playwright asserts runtime script/link references do not contain `archive/v1-v2`.
- PASS: Theme V2 HTML restrictions preserved. Evidence: `rg --pcre2 -n "<script(?![^>]*\\bsrc=)|<style\\b|\\son[a-z]+\\s*=" toolbox/assets/index.html toolbox/tags/index.html` returned no matches.

## Changed Files
- `assets/theme-v2/images/badges/tags-1024.png`
- `assets/theme-v2/images/badges/tags.png`
- `assets/theme-v2/images/tools/tags-1024.png`
- `assets/theme-v2/images/tools/tags.png`
- `docs_build/tools-images-generated/tags.txt`
- `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `src/dev-runtime/persistence/tool-repositories/tags-mock-repository.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `tests/playwright/tools/TagsTool.spec.mjs`
- `toolbox/assets/assets.js`
- `toolbox/tags/index.html`
- Validation-generated reports under `docs_build/dev/reports/*`.

## Validation Performed
- PASS: `node --check toolbox/assets/assets.js`
- PASS: `node --check toolbox/tags/tags.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/tags-mock-repository.js`
- PASS: `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS: `node --check src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- PASS: `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS: `node --check tests/playwright/tools/TagsTool.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/TagsTool.spec.mjs tests/playwright/tools/AssetToolMockRepository.spec.mjs --reporter=line --workers=1` (4 passed)
- PASS: `npx playwright test tests/playwright/tools/ToolImageRegistry.spec.mjs --reporter=line --workers=1` (5 passed)
- PASS: `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs --reporter=line --workers=1` (4 passed)
- PASS: `npm run test:workspace-v2` (workspace-contract lane, 5 passed)

## Playwright Result
- PASS: Targeted Tags/Assets Playwright behavior checks passed.
- PASS: Toolbox image registry checks passed.
- PASS: Workspace contract lane passed through `npm run test:workspace-v2`.

## V8 Coverage
- PASS/WARN: `docs_build/dev/reports/playwright_v8_coverage_report.txt` produced.
- PASS: Browser runtime coverage includes `toolbox/assets/assets.js` at 96%, `toolbox/tags/tags.js` at 100%, `toolbox/assets/assets-api-client.js` at 67%, and `toolbox/tags/tags-api-client.js` at 100%.
- WARN: Dev-runtime repository and mock DB modules are server/dev adapter code and were not collected by browser V8 coverage; covered by direct repository tests and syntax checks.

## Skipped Lanes
- SKIP: Full samples smoke. Safe to skip because this PR is scoped to Tags, Assets, toolbox registration, and mock repository/table contracts; sample JSON/runtime alignment is explicitly out of scope.
- SKIP: Engine lane. Safe to skip because no `src/engine/input`, parser, renderer, or game runtime engine behavior changed.
- SKIP: Production auth/account lanes. Safe to skip because no auth, production DB, or account behavior changed.

## Manual Validation Steps
1. Open `/toolbox/tags/index.html`.
2. Confirm the Tags table shows `Tag Name`, `Description`, `Usage Count`, and `Actions`, with `Add Tag` below the table.
3. Add a tag, expand usage, edit it, and delete it.
4. Open `/toolbox/index.html` and confirm the Tags tile appears with Tags artwork.
5. Open `/toolbox/assets/index.html`.
6. Confirm only the seven MVP asset accordions appear.
7. Confirm upload tables use Source/File columns and reference tables use Reference.
8. Add an Images asset, choose a shared Tag from the type-ahead, save, view, edit, reload, and delete.
9. Confirm no `Projectile`, `Color`, `Localization`, `Shader`, or `Video` options appear in active Assets behavior.

## Samples Decision
- SKIP: Full samples smoke was not run. The PR does not touch samples, game manifests, sample JSON, or runtime engine behavior.
