# PR_26163_072-assets-source-upload-reference-details

## Branch Validation
- PASS: current branch is `main`.
- Expected branch: `main`.

## Impacted Lanes
- Toolbox Assets runtime lane.
- Assets mock DB repository lane.
- Targeted Playwright lane: `tests/playwright/tools/AssetToolMockRepository.spec.mjs`.
- Workspace contract lane via legacy command `npm run test:workspace-v2`.

## Requirement Checklist
- PASS: `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before implementation.
- PASS: `toolbox/assets/index.html` remains external-JS/external-CSS only; no inline script/style/event handlers were added.
- PASS: asset add/edit rows expose Source selection where supported.
- PASS: Upload source shows a file picker, not a free-text File field.
- PASS: Images Upload file selection updates the visible File detail with the selected filename.
- PASS: Audio Upload file selection updates the visible File detail with the selected filename.
- PASS: Fonts Upload file selection updates the visible File detail with the selected filename.
- PASS: Images show Reference as an option after a valid same-type reference source exists.
- PASS: Fonts show Upload only until a valid reference source exists.
- PASS: Reference source shows a Reference selector instead of an upload picker.
- PASS: missing reference sources fail visibly with `No valid reference source exists.` and save is blocked.
- PASS: upload save without a selected file fails visibly with `Choose an upload file before saving.`
- PASS: generated fake filenames were removed from the catalog asset path; `catalogFileNameForName` no longer exists.
- PASS: Source does not silently switch between Upload and Reference; changes happen through the Source dropdown.
- PASS: active MVP asset types remain Images, Audio, Fonts, Sprites, Vectors, Palette References, and Data.
- PASS: Projectile remains absent from usage dropdown values.
- PASS: shared Tags type-ahead behavior is preserved.
- PASS: user-owned asset records remain scoped to the owning user.
- PASS: scope stayed limited to Assets source/upload/reference behavior, targeted tests, and required reports.

## Changed Files
- `toolbox/assets/assets.js`
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_072-assets-source-upload-reference-details.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Validation Performed
- PASS: `node --check toolbox/assets/assets.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS: `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --reporter=line --workers=1`
  - Result: 3 passed.
- PASS: `npm run test:workspace-v2`
  - Result: 5 passed.

## Playwright Result
- PASS: targeted Assets Playwright validates source dropdowns, upload file selection, reference selector behavior, missing reference failure, upload-without-file failure, shared Tags type-ahead, owner scope, and absence of Projectile.

## V8 Coverage
- WARN/PASS: browser runtime coverage for `toolbox/assets/assets.js` was collected at 94%.
- WARN: `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js` is exercised through Node-side repository assertions and API-backed browser behavior, but is not browser-collected V8 runtime code.
- Details: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Skipped Lanes
- Samples validation: SKIP. Samples are explicitly out of scope; this PR only changes the Assets tool source/upload/reference behavior and its mock repository contract.
- Full samples smoke: SKIP. The request explicitly says not to run full samples smoke.
- Broad unrelated toolbox lanes: SKIP. No shared navigation, tool registry, auth, sample JSON, or production runtime behavior changed.

## Manual Validation Steps
1. Open `toolbox/assets/index.html`.
2. Reset Asset Library.
3. In Images, click Add Images, confirm Source defaults to Upload and the File cell shows an upload picker.
4. Try Save without selecting a file and confirm a visible failure.
5. Select an image file and confirm the File detail shows the filename.
6. Save, then add another Images row and confirm Reference appears as a Source option.
7. Select Reference and confirm a Reference selector appears instead of an upload picker.
8. Open Audio and Fonts add rows and confirm Upload file selection displays the selected filename.
9. Open Palette References add row with no palette source and confirm the missing reference failure is visible.

## Samples Decision
- SKIP: no sample JSON alignment, sample runtime, or sample smoke behavior is in scope for PR_26163_072.
