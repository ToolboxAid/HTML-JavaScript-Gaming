# PR_26163_081-assets-upload-progress-auto-hide

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Upload Diagnostics now lives in its own vertical accordion in the right Inspector column.
- PASS: Upload Diagnostics appears above Status Log. Playwright validates the accordion vertical position.
- PASS: Inline upload progress remains under the relevant asset table while an upload is active.
- PASS: After an all-OK upload completes, verbose progress/details are hidden and a compact summary remains in Upload Diagnostics.
- PASS: User-facing upload file results table removes the Message column.
- PASS: User-facing upload file results table shows only `File` and `Status`.
- PASS: Long write-path/debug messages are not rendered in the user-facing file results table.
- PASS: Verbose write-path/debug details remain out of page UI and are preserved only through diagnostics/report evidence.
- PASS: Status Log has a Clear button.
- PASS: Clear clears only user-facing Status Log and batch log content.
- PASS: Clear does not delete asset records, upload diagnostics, uploaded files, or reports.
- PASS: All-OK upload hides verbose progress/details after completion and leaves compact success status.
- PASS: FAIL/WARN/SKIP details remain visible through concise upload issue rows without a long debug Message column.
- PASS: Delete-file behavior from PR_26163_080 remains covered by targeted Assets Playwright.
- PASS: Server-received byte progress and one-second update behavior from PR_26163_080 remain covered by targeted Assets Playwright.
- PASS: Duplicate blocking remains covered by targeted Assets Playwright.
- PASS: `/projects/` path safety remains covered by targeted Assets Playwright.
- PASS: `codex_review.diff` is generated as readable UTF-8 text.

## Diagnostics Accordion Evidence

- `toolbox/assets/index.html` adds `data-asset-tool-upload-diagnostics-accordion` as a right-column vertical accordion.
- `toolbox/assets/index.html` places Upload Diagnostics before `data-asset-tool-status-log-accordion`.
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs` validates Upload Diagnostics appears above Status Log using rendered bounding boxes.

## Status Log Clear Evidence

- `toolbox/assets/index.html` adds `data-asset-tool-clear-status-log`.
- `toolbox/assets/assets.js` wires Clear to empty `data-asset-tool-log` and `data-asset-tool-batch-log` only.
- Playwright validates Clear leaves Upload Diagnostics visible and leaves uploaded asset rows intact.

## Upload Auto-Hide Evidence

- `toolbox/assets/assets.js` hides `data-asset-tool-upload-progress-details` when upload phase is `Complete`.
- `toolbox/assets/assets.js` keeps `data-asset-tool-upload-compact-status` populated with the final summary.
- Inline upload progress is populated with final values and hidden after completion.
- Playwright validates all-OK upload leaves `Upload summary: 2 written, 0 failed, 0 skipped, 0 warnings.` and hides verbose progress/details.

## Failure Detail Evidence

- `toolbox/assets/assets.js` renders concise issue rows in `data-asset-tool-upload-issues` for WARN/FAIL/SKIP.
- File status rows render only file name and status.
- Playwright validates duplicate, path escape, missing project, unsupported write, invalid type, warning, and skip cases remain visible without `projects/` debug paths in the user-facing file status table.

## Changed Files

- `toolbox/assets/index.html`
- `toolbox/assets/assets.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- Workspace validation reports refreshed by required `npm run test:workspace-v2`
- `docs_build/dev/reports/PR_26163_081-assets-upload-progress-auto-hide.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`

## Impacted Lanes

- Toolbox Assets runtime/UI lane.
- Assets mock repository Playwright lane.
- Workspace V2 validation command was run because it is explicitly required by the PR request.

## Skipped Lanes

- Full samples smoke: SKIP. Samples are not in scope, no sample JSON was changed, and the request explicitly says not to run full samples smoke.
- Engine runtime: SKIP. No engine runtime files were changed.
- Auth/account runtime: SKIP. Account prompt behavior was preserved; no account/auth code was changed.

## Validation Performed

- PASS: `git branch --show-current`
- PASS: `node --check toolbox/assets/assets.js`
- PASS: `node --check toolbox/assets/assets-upload-worker.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS: `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS: `git diff --check -- toolbox/assets/assets.js toolbox/assets/index.html src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js tests/playwright/tools/AssetToolMockRepository.spec.mjs`
  - Note: Git reported expected CRLF normalization warnings for touched HTML/spec files.
- PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --workers=1 --reporter=list`
  - Result: 15 passed.
- PASS: `npm run test:workspace-v2`
  - Result: Workspace contract validation passed, 5 tests passed.
- PASS: V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Playwright Result

- PASS: Targeted Assets Playwright passed.
- PASS: Required workspace validation passed.

## V8 Coverage

- PASS: `toolbox/assets/assets.js` collected by browser V8 coverage at 93% function coverage.
- WARN: `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js` is listed as changed runtime JS but is Node/dev-runtime mock code and is not collected by browser V8 coverage. This is advisory per project instructions.

## Manual Validation Steps

1. Open `toolbox/assets/index.html` with a Local DB/dev storage-backed project selected.
2. Expand the right Inspector column and confirm Upload Diagnostics is above Status Log.
3. Upload image files and confirm inline progress appears below the Images table while active.
4. Confirm a successful upload leaves a compact Upload Diagnostics summary and hides verbose progress details.
5. Confirm the upload file results table has only File and Status columns.
6. Click Clear in Status Log and confirm status text/log entries clear while upload diagnostics and asset rows remain.
7. Re-upload an existing filename and confirm the concise duplicate warning appears without a verbose project path in the table.

## Samples Decision

- SKIP: Full samples smoke was not run because this PR only changes Toolbox Assets UI/runtime diagnostics and targeted tests, and the user explicitly requested not to run full samples smoke.

## Review Artifacts

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Delta ZIP

- `tmp/PR_26163_081-assets-upload-progress-auto-hide_delta.zip`
