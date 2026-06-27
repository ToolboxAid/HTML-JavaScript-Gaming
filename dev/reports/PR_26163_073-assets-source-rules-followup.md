# PR_26163_073-assets-source-rules-followup

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
- PASS: current branch was verified as `main` before changes.
- PASS: Data assets support Source options `Upload` and `Reference`.
- PASS: Data Upload file picker accepts `.json`, `.csv`, and `.txt`.
- PASS: Data Upload uses the selected filename in the File detail and saved row.
- PASS: Data Upload save without a selected file fails visibly with `Choose an upload file before saving.`
- PASS: Sprite add/edit rows are Reference-only for MVP and do not show upload file selection.
- PASS: Vector add/edit rows are Reference-only for MVP and do not show upload file selection.
- PASS: Palette References remain Reference-only.
- PASS: Image, Audio, and Font upload filename behavior remains covered and passing.
- PASS: user-facing source help text appears per asset type in add/edit rows.
- PASS: no fake filename generator exists; `catalogFileNameForName` is absent.
- PASS: Source modes change only through explicit Source dropdown selection.
- PASS: Projectile remains absent from usage values.
- PASS: shared Tags type-ahead behavior remains covered and passing.
- PASS: owner-scoped asset records remain covered and passing.
- PASS: scope stayed limited to Assets source rules, targeted tests, and required reports.

## Changed Files
- `toolbox/assets/assets.js`
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_073-assets-source-rules-followup.md`
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
- PASS: `git diff --check`

## Playwright Result
- PASS: targeted Assets Playwright validates Data Upload/Reference, Data `.json`/`.csv`/`.txt` filename capture, Data upload missing-file failure, Sprite/Vector/Palette Reference-only source rules, Image/Audio/Font upload filename behavior, Projectile absence, shared Tags type-ahead, and owner scope.

## V8 Coverage
- PASS/WARN: `toolbox/assets/assets.js` browser V8 coverage collected at 96%.
- WARN: `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js` is exercised through Node-side repository assertions and API-backed browser behavior, but is not browser-collected V8 runtime code.
- Details: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Search Evidence
- PASS: `toolbox/assets/assets.js` contains `const REFERENCE_ONLY_ASSET_TYPES = new Set(["Sprites", "Vectors", "Palette References"]);`.
- PASS: `toolbox/assets/assets.js` contains `const ALWAYS_MIXED_SOURCE_ASSET_TYPES = new Set(["Data"]);`.
- PASS: `toolbox/assets/assets.js` contains `Data can upload .json, .csv, or .txt files`.
- PASS: `toolbox/assets/assets.js` contains `Sprites are Reference-only for MVP.`
- PASS: `toolbox/assets/assets.js` contains `Vectors are Reference-only for MVP.`
- PASS: `toolbox/assets/assets.js` contains `Palette References must reference a palette swatch.`
- PASS: `rg "catalogFileNameForName|fake filename"` returned no active implementation matches.
- PASS: Projectile appears only in negative Playwright assertions confirming it is absent.

## Skipped Lanes
- Samples validation: SKIP. Samples are explicitly out of scope; this PR only changes the Assets tool source-rule behavior and its mock repository contract.
- Full samples smoke: SKIP. The request explicitly says not to run full samples smoke.
- Broad unrelated toolbox lanes: SKIP. No shared navigation, tool registry, auth, sample JSON, or production runtime behavior changed.

## Manual Validation Steps
1. Open `toolbox/assets/index.html`.
2. Reset Asset Library.
3. Add Data and confirm Source offers Upload and Reference.
4. Save Data Upload without selecting a file and confirm visible failure.
5. Select `.json`, `.csv`, then `.txt` files and confirm the File detail updates to the selected filename.
6. Save Data Upload, then add another Data row and choose Reference to confirm the reference selector appears.
7. Add Sprites and Vectors and confirm only Reference is available and no Upload File picker appears.
8. Add Palette References and confirm it remains Reference-only.
9. Add Images, Audio, and Fonts and confirm Upload filename display still works.

## Samples Decision
- SKIP: no sample JSON alignment, sample runtime, or sample smoke behavior is in scope for PR_26163_073.
