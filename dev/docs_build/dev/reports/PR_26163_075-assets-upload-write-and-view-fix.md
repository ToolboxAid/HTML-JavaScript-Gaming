# PR_26163_075-assets-upload-write-and-view-fix

## Branch Validation
- PASS - Current branch: `main`
- PASS - Expected branch: `main`

## Requirement Checklist
- PASS - Uploaded files are physically written under `projects/<projectId>/<asset-type>/` for upload-capable Assets types. Evidence: `tests/playwright/tools/AssetToolMockRepository.spec.mjs` verifies `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/write-view-image.png` exists after upload.
- PASS - Uploads are not marked OK until the file exists on disk after write. Evidence: `assets-mock-repository.js` writes with `writeFileSync`, then checks `existsSync` before creating the asset record.
- PASS - Missing project asset folders are created. Evidence: Playwright removes the image folder before upload and verifies it is recreated.
- PASS - Asset records store project-relative paths. Evidence: asset records now store `storedPath`, `path`, `targetFilePath`, and `viewPath`.
- PASS - Image View previews the written file. Evidence: Playwright checks the View preview image `src` and `naturalWidth`.
- PASS - Audio, Font, and Data View use the stored project-relative path. Evidence: Playwright checks `src`/`href` for `audio`, `font`, and `data` uploaded records.
- PASS - Unsupported browser/runtime file writes fail visibly and create no records. Evidence: `?uploadWrite=unsupported` test shows visible FAIL/SKIP diagnostics and count remains `0`.
- PASS - Diagnostics show project id, target folder, target file path, write result, and view path. Evidence: View metadata and batch dialog/status rows include those fields.
- PASS - Multi-file upload diagnostics from PR074 are preserved. Evidence: targeted Playwright checks dialog progress, bytes, BPS, speed, ETA, elapsed, per-file statuses, and batch summary.
- PASS - Uploads remain scoped only to `projects/`. Evidence: repository path resolver rejects paths outside `projects/<projectId>/`.
- PASS - Sprite, Vector, and Palette References remain Reference-only. Evidence: targeted Playwright verifies no upload file input for those asset types.
- PASS - `codex_review.diff` is readable UTF-8 text. Evidence: existing Playwright check passes after artifact generation.

## Changed Files
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `src/dev-runtime/server/local-api-server.mjs`
- `tests/helpers/playwrightRepoServer.mjs`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `toolbox/assets/assets.js`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_075-assets-upload-write-and-view-fix.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## File-Write Evidence
- PASS - Folder creation: Playwright removes `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/`, uploads `write-view-image.png`, then verifies the folder exists.
- PASS - File write: Playwright verifies `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/write-view-image.png` exists and equals the selected PNG bytes.
- PASS - Record gating: Playwright verifies unsupported write mode reports FAIL and creates no asset record.

## View-Preview Evidence
- PASS - Image View renders the written image path and verifies `naturalWidth > 0`.
- PASS - Audio View uses the uploaded `projects/<projectId>/audio/...` path.
- PASS - Font View uses the uploaded `projects/<projectId>/font/...` path.
- PASS - Data View uses the uploaded `projects/<projectId>/data/...` path.

## Impacted Lanes
- Assets tool runtime lane.
- Assets mock repository/dev-runtime upload persistence lane.
- Local/static file serving lane for uploaded asset content types.
- Targeted Assets Playwright lane.
- Workspace V2 contract lane.

## Skipped Lanes
- Full samples smoke: SKIP - explicitly out of scope for this PR; this change is limited to Assets upload/write/view behavior and targeted workspace validation was run.
- Production DB/auth/account lanes: SKIP - no production DB, auth, or account behavior changed.

## Validation Performed
- PASS - `node --check toolbox/assets/assets.js`
- PASS - `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS - `node --check src/dev-runtime/server/local-api-server.mjs`
- PASS - `node --check tests/helpers/playwrightRepoServer.mjs`
- PASS - `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS - `git diff --check` before generating review artifacts; final source/report check used `git diff --check -- . ':!docs_build/dev/reports/codex_review.diff'` because raw diff artifacts can contain trailing whitespace from the captured patch.
- PASS - `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --workers=1 --reporter=list` -> 8 passed
- PASS - `npm run test:workspace-v2` -> 5 passed in workspace-contract lane

## Playwright Result
- PASS - Targeted Assets Playwright: 8 passed.
- PASS - Workspace V2: 5 passed.

## V8 Coverage
- WARN/PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` refreshed from targeted Assets Playwright.
- PASS - Browser runtime `toolbox/assets/assets.js`: 96% advisory V8 coverage.
- WARN - Node-side changed JS (`assets-mock-repository.js`, local server files, Playwright helpers/specs) is not collected by browser V8 coverage; covered by targeted Playwright behavior and `node --check`.

## Manual Validation Steps
1. Open `toolbox/assets/index.html` through the local API-backed server.
2. Add an Image upload with a real image file.
3. Confirm the status/metadata shows Project ID, Target folder, Target file path, Write result, and View path.
4. Confirm the file exists under `projects/<projectId>/image/`.
5. Click View and confirm the image preview renders from the stored project-relative path.
6. Repeat for Audio, Font, and Data and confirm View uses the stored project path.
7. Open `toolbox/assets/index.html?uploadWrite=unsupported`, upload images, and confirm visible FAIL/SKIP diagnostics with no created records.

## Samples Decision
- SKIP - Full samples smoke was not run because the request explicitly said not to run it and no sample runtime behavior was changed.
