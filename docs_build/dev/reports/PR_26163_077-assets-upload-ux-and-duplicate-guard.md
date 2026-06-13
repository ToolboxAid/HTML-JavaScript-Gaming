# PR_26163_077-assets-upload-ux-and-duplicate-guard

## Branch Validation
- PASS - Current branch: `main`
- PASS - Expected branch: `main`

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS - Improved upload progress visibility with a local/dev-only delay hook. Evidence: `toolbox/assets/assets.js` uses `uploadProgressDelayMs` only on local/dev hosts; production hosts get `0` simulated delay.
- PASS - Progress still reflects selected files and final write results. Evidence: Playwright verifies bytes/BPS/speed/ETA/elapsed render during upload, no OK status appears before final write status, and final rows include OK/FAIL/SKIP outcomes.
- PASS - Duplicate project folder/path uploads are blocked before write. Evidence: repository checks `existsSync(resolved.absolutePath)` before `writeFileSync`.
- PASS - Duplicate blocked upload creates no extra asset record. Evidence: Playwright uploads `duplicate-path.png`, retries the same file, sees FAIL, and count remains `1`.
- PASS - Saved asset edit allows Usage and Tags only. Evidence: Playwright changes Usage to `Icon`, adds tag `Rare`, and saves.
- PASS - Saved asset edit does not allow Source/File/Filename/Path/Asset Type changes. Evidence: saved edit row has no Source select, Upload File input, Reference select, Asset Type field, or project path edit surface; repository malicious-update test preserves the original file/type/path.
- PASS - File picker text uses `No file chosen` initially and no longer shows `No file selected`. Evidence: Playwright checks the add row text.
- PASS - File picker shows selected filenames after selection. Evidence: Playwright checks `batch-image-a.png, batch-image-b.png`.
- PASS - Auto-start upload on file selection is preserved. Evidence: tests set files and assert rows/logs without clicking Save.
- PASS - Images, Audio, and Fonts remain upload-capable. Evidence: targeted Playwright uploads each type.
- PASS - Data and Vector Add buttons remain Planned/disabled from PR_076. Evidence: source-control Playwright checks both disabled buttons with Planned title.
- PASS - Sprites and Palette References remain reference-only. Evidence: targeted Playwright verifies no upload file input.
- PASS - Guest upload prompt behavior is preserved. Evidence: guest test still shows `Uploads require a Game Foundry account.` with `Sign In` and `Create Account`, and creates no record.
- PASS - Owner-scoped records are preserved. Evidence: existing user1/user2 owner-scope Playwright still passes.
- PASS - `codex_review.diff` is generated as readable UTF-8 text. Evidence: artifact writer uses UTF-8 and the Playwright UTF-8 check passes.

## Upload Progress Evidence
- PASS - `?uploadProgressDelayMs=250` is used in targeted Playwright as a local/dev validation hook.
- PASS - Upload dialog shows current file, file count, bytes uploaded, total bytes, BPS, speed, ETA, elapsed time, phase, per-file statuses, and batch summary.
- PASS - During upload, phase is `Uploading`, progress fields are non-zero/visible, and OK rows are absent before the final write result.
- PASS - Completion shows final OK/WARN/FAIL/SKIP rows and batch summary.

## Duplicate-Block Evidence
- PASS - First `duplicate-path.png` upload writes `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/duplicate-path.png`.
- PASS - Second upload of the same filename fails with `already exists`.
- PASS - Count remains `1`; no duplicate asset row is created.

## Saved-Edit Lock Evidence
- PASS - Saved upload edit row displays Source/File as text and only exposes Usage, Tags, Save, and Cancel controls.
- PASS - Repository update ignores attempted changes to asset type, source, replacement file, filename, name, and path for an existing record.
- PASS - Usage and Tags changes persist.

## Changed Files
- `toolbox/assets/assets.js`
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_077-assets-upload-ux-and-duplicate-guard.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Impacted Lanes
- Assets tool runtime lane.
- Assets mock repository/dev-runtime upload persistence lane.
- Targeted Assets Playwright lane.
- Workspace V2 contract lane.

## Skipped Lanes
- Full samples smoke: SKIP - explicitly out of scope; no sample runtime behavior changed.
- Production auth/account system: SKIP - guest upload blocking remains the existing UI/session prompt behavior.
- Unrelated toolbox tools: SKIP - scope is limited to Assets upload UX and duplicate guards.

## Validation Performed
- PASS - `node --check toolbox/assets/assets.js`
- PASS - `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS - `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS - `git diff --check -- toolbox/assets/assets.js src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS - `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --workers=1 --reporter=list` -> 10 passed
- PASS - `npm run test:workspace-v2` -> 5 passed in workspace-contract lane

## Playwright Result
- PASS - Targeted Assets Playwright: 10 passed.
- PASS - Workspace V2: 5 passed.

## V8 Coverage
- PASS/WARN - `docs_build/dev/reports/playwright_v8_coverage_report.txt` refreshed from targeted Assets Playwright.
- PASS - Browser runtime `toolbox/assets/assets.js`: 96% advisory V8 coverage.
- WARN - Node-side repository file is not collected by browser V8 coverage; duplicate/edit-lock behavior is covered by targeted Playwright and syntax checks.

## Manual Validation Steps
1. Open `toolbox/assets/index.html?uploadProgressDelayMs=250` through the local API-backed server.
2. Add Images and select multiple image files.
3. Confirm upload diagnostics update while upload is running and do not show OK before final write status.
4. Upload an Image file, then try uploading the same filename again for the same project.
5. Confirm visible FAIL/WARN duplicate messaging and no additional asset row.
6. Edit the saved asset and confirm only Usage and Tags are editable.
7. Confirm the saved edit row does not allow Source/File/Filename/Path/Asset Type changes.
8. Open as guest and confirm upload action prompts for a Game Foundry account without creating a record.

## Samples Decision
- SKIP - Full samples smoke was not run because the request explicitly said not to run it and this PR is scoped to Assets upload UX/repository behavior.
