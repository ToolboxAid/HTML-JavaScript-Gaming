# PR_26163_079-assets-byte-accurate-upload-progress

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before changes.
- PASS: Continued from PR_26163_078.
- PASS: Replaced staged upload progress with byte-based progress.
- PASS: Progress bar percentage is calculated as `bytesUploaded / totalBytes`.
- PASS: Upload file processing now runs through `toolbox/assets/assets-upload-worker.js`.
- PASS: Dev/test throttled uploads update incrementally per worker chunk.
- PASS: Progress starts at 0 before first bytes upload.
- PASS: Progress does not jump to 50% on start.
- PASS: Progress reaches 100 only after selected bytes are processed and repository write succeeds.
- PASS: Failed write after byte transfer shows FAIL and creates no asset record.
- PASS: Batch progress uses summed uploaded bytes divided by summed selected bytes.
- PASS: Inline upload progress remains below each upload-capable asset table.
- PASS: `/projects/` directory validation and create-if-missing behavior are preserved from PR_26163_078.
- PASS: Duplicate same folder/filename blocking is preserved.
- PASS: `codex_review.diff` is UTF-8 readable.
- PASS: Full samples smoke was not run.

## Byte Progress Evidence

- Playwright test `Assets worker upload progress is byte accurate and keeps the UI responsive` validates:
  - progress value starts at `0`;
  - bytes uploaded starts at `0 B`;
  - first chunk progress is greater than `0`, less than `50`, and not equal to `50`;
  - later chunk progress is greater than the first chunk value;
  - final successful upload reaches `100`.
- Playwright test `Assets batch progress uses summed uploaded bytes across selected files` validates two equal 20-byte files reach `50` after the first file succeeds, then `100` when both writes succeed.
- Playwright test `Assets upload write failure after byte transfer is visible and creates no asset record` validates bytes progress becomes greater than `0`, remains below `100`, shows FAIL, and asset count stays `0`.

## UI Responsiveness Evidence

- During throttled worker upload, Playwright toggles the Audio accordion and verifies its `open` state changes.
- During throttled worker upload, Playwright scrolls the page and verifies `window.scrollY > 0`.
- Progress fields continue rendering while the UI remains interactive: BPS, speed, ETA, elapsed, current file, and per-file status are asserted during/after throttled upload.
- No cancel/stop upload control exists in the current Assets UI; no cancel behavior was added in this PR.

## Worker / Background Execution Evidence

- New worker file: `toolbox/assets/assets-upload-worker.js`.
- Assets page creates the worker with `new Worker(UPLOAD_WORKER_URL, { type: "module" })`.
- Playwright waits for the `worker` event and asserts the worker URL contains `toolbox/assets/assets-upload-worker.js`.
- Inline upload diagnostics expose worker status (`Active`, `Write Pending`, `Complete`, `Failed`) for validation.

## Throttled Upload Evidence

- Dev/test throttling remains query-parameter controlled through `uploadProgressDelayMs`.
- Added dev/test chunk-size control through `uploadChunkSizeBytes`.
- Targeted tests use throttled uploads with small chunks to validate incremental progress without affecting production uploads.

## Changed Files

- `toolbox/assets/assets.js`
- `toolbox/assets/assets-upload-worker.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_079-assets-byte-accurate-upload-progress.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Impacted Lanes

- runtime: Assets upload UI progress and worker-backed file processing.
- integration: Assets upload path through server/mock repository remains exercised by Playwright.
- recovery/UAT: targeted Assets Playwright coverage for throttled upload behavior and failure behavior.

## Skipped Lanes

- samples: SKIP. This PR is scoped to Toolbox Assets upload progress and does not change sample runtime contracts.
- engine: SKIP. No engine input/render/game runtime files changed.

## Validation Performed

- PASS: `node --check toolbox/assets/assets.js`
- PASS: `node --check toolbox/assets/assets-upload-worker.js`
- PASS: `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS: `git diff --check -- toolbox/assets/assets.js toolbox/assets/assets-upload-worker.js tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS: `git diff --check -- .`
- PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --workers=1 --reporter=list`
  - Result: 13 passed.
- PASS: `npm run test:workspace-v2`
  - Result: workspace-contract lane passed, 5 Playwright tests passed.

## Playwright Result

- PASS: Targeted Assets Playwright suite passed 13/13.
- PASS: `npm run test:workspace-v2` passed.

## V8 Coverage

- Coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS: `toolbox/assets/assets.js` collected browser V8 coverage: 93%.
- WARN: `toolbox/assets/assets-upload-worker.js` is listed in the changed runtime JS coverage report, but Chromium page-level V8 coverage did not collect dedicated worker script coverage. Worker execution is still validated by Playwright worker-event assertions.
- WARN: `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js` appears from the stacked HEAD changed-file coverage baseline and is Node-side repository code not collected by Chromium page coverage.

## Manual Validation Steps

1. Open `/toolbox/assets/index.html?uploadProgressDelayMs=180&uploadChunkSizeBytes=8` in local DB mode.
2. Reset Asset Library.
3. Add Images, choose a usage, and select a file.
4. Confirm inline upload progress starts at `0%`, then increments by bytes instead of jumping to `50%`.
5. Confirm BPS, speed, ETA, elapsed, current file, and bytes uploaded update while the upload is running.
6. Toggle another asset accordion during upload and confirm it remains responsive.
7. Confirm successful write reaches `100%` and creates one asset record.
8. Repeat with write support disabled and confirm FAIL appears, progress remains below `100%`, and no record is created.

## Samples Validation

- Full samples smoke: SKIP.
- Reason: requested skip, and this PR is limited to Assets upload progress behavior.
