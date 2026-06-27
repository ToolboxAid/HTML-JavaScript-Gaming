# PR_26163_080-assets-delete-file-and-received-progress

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Scope

- Impacted lane: Assets tool runtime lane, Assets dev/mock repository lane, Assets Playwright behavior coverage.
- Playwright impacted: Yes.
- Samples validation: SKIP. Samples are out of scope for this Assets upload/delete tool fix and no sample JSON/runtime behavior was changed.
- Full samples smoke: SKIP for the same reason.

## Requirement Checklist

- PASS: Trash for uploaded assets deletes the asset DB record and physical file. Evidence: targeted Playwright `Assets Trash deletes uploaded records and physical files with scoped failure handling` verifies the row is removed and `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/trash-delete-ok.png` no longer exists.
- PASS: Trash verifies the physical file no longer exists before reporting deleted. Evidence: repository delete returns success only after `existsSync` is false after `unlinkSync`; Playwright verifies the file is gone.
- PASS: Trash failure shows FAIL and does not claim deleted. Evidence: targeted Playwright removes the physical file before Trash, expects visible `FAIL: Upload file delete failed`, and verifies the asset row remains.
- PASS: Delete paths are scoped only under `/projects/`. Evidence: repository delete resolves stored project-relative paths through the existing `/projects/<projectId>/` guard.
- PASS: Outside `/projects/` delete is rejected. Evidence: targeted Playwright uses the dev-only unsafe delete-path hook and verifies visible `FAIL: Upload file delete failed: target path must stay under /projects/<projectId>/` with the row and real project file preserved.
- PASS: Progress percent equals server-received bytes divided by total file bytes. Evidence: `toolbox/assets/assets.js` progress metrics use `serverBytesReceived`; targeted Playwright records 8 B -> 16% and 16 B -> 33% for a 48 B upload.
- PASS: Progress does not reach 100% until server-received bytes cover the file and write succeeds. Evidence: server receive stops at `fileSize - 1` before repository write; targeted Playwright verifies progress remains below 100 before completion and reaches 100 only after the OK row/write success.
- PASS: Upload progress UI updates once per second while active. Evidence: targeted Playwright records two server-received progress events and verifies their timestamps are at least 900 ms apart for the one-second cadence.
- PASS: BPS, speed, ETA, elapsed, and percent use server-received byte counts. Evidence: `uploadProgressMetrics` computes from `serverBytesReceived`; targeted Playwright verifies BPS > 0, speed `/s`, ETA, elapsed, and server-received bytes.
- PASS: Browser/client bytes sent differs from server bytes received behavior is authoritative to server received. Evidence: worker progress updates `clientBytesSent` only and does not drive the meter; the visible meter uses `serverBytesReceived`.
- PASS: Worker/background upload path remains. Evidence: targeted Playwright observes the `toolbox/assets/assets-upload-worker.js` worker and verifies accordion/scroll responsiveness during upload.
- PASS: Duplicate folder/filename blocking remains. Evidence: targeted Playwright `Assets duplicate project-path uploads fail before write and do not create duplicate records` passes.
- PASS: Inline upload progress remains under the relevant asset table. Evidence: existing targeted Playwright asserts inline progress appears below the Images table.
- PASS: `codex_review.diff` is UTF-8 readable. Evidence: artifact writer uses UTF-8; targeted Playwright UTF-8 artifact check passed.

## Delete-File Evidence

- Success path: uploaded `trash-delete-ok.png`, clicked Trash, visible log included `Deleted file projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/trash-delete-ok.png.`, asset row count became zero, and the file no longer existed on disk.
- Missing-file failure path: uploaded `trash-delete-missing.png`, removed the physical file, clicked Trash, visible log included `FAIL: Upload file delete failed`, and the asset row remained.
- Unsafe path failure path: dev-only unsafe delete hook resolved an escaping path, clicked Trash, visible log rejected the path under `/projects/<projectId>/`, and the real stored project file remained.

## Server-Received Progress Evidence

- Progress source: `serverBytesReceived` is the only visible meter source; worker/client progress only records `clientBytesSent`.
- One-second cadence: Playwright observed server-received progress events 8 B and 16 B at least 900 ms apart.
- Percent evidence: 8 B / 48 B rendered 16%; 16 B / 48 B rendered 33%; final 100% rendered after write success.
- Responsiveness evidence: Playwright toggled another accordion and scrolled during active upload while progress continued.

## Validation Performed

- PASS: `node --check toolbox/assets/assets.js`
- PASS: `node --check toolbox/assets/assets-upload-worker.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS: `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS: `git diff --check -- toolbox/assets/assets.js toolbox/assets/index.html src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --workers=1 --reporter=list` -> 15 passed.
- PASS: `npm run test:workspace-v2` -> workspace-contract lane 5 passed.
- PASS: final targeted rerun `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --workers=1 --reporter=list` -> 15 passed.

## Playwright Result

- PASS: Assets targeted Playwright: 15 passed.
- PASS: Workspace V2 command: 5 passed in workspace-contract lane.

## Coverage

- Coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS/WARN: PASS for generated coverage report. WARN is expected/advisory for changed server-side dev repository and worker files not collected by browser V8 coverage.
- Changed runtime JavaScript coverage highlights:
  - `(93%) toolbox/assets/assets.js`
  - `(0%) src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js` WARN, server/dev repository not collected by browser V8 coverage.
  - `(0%) toolbox/assets/assets-upload-worker.js` WARN, worker coverage not collected by the current V8 reporter.

## Changed Files

- `toolbox/assets/assets.js`
- `toolbox/assets/index.html`
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Workspace validation report files refreshed by the required `npm run test:workspace-v2` command.
- Required review artifacts generated separately:
  - `docs_build/dev/reports/codex_review.diff`
  - `docs_build/dev/reports/codex_changed_files.txt`
- Repo-structured delta ZIP:
  - `tmp/PR_26163_080-assets-delete-file-and-received-progress_delta.zip`

## Manual Validation Steps

1. Open `toolbox/assets/index.html` using Local DB mode with a signed-in user.
2. Add an Image upload and verify the inline progress panel starts at 0 B received.
3. Confirm the visible progress increments from server-received bytes at one-second intervals.
4. Confirm the meter reaches 100% only after the upload row reports OK.
5. Click Trash on the uploaded asset and confirm the DB row disappears and the stored `projects/<projectId>/image/<filename>` file is gone.
6. Repeat with a missing physical file and confirm the UI shows FAIL and keeps the asset row.

## Skipped Lanes

- Samples: SKIP because no sample JSON, sample launch, or game runtime behavior was changed.
- Engine lane: SKIP because no engine input/runtime code changed.
- Auth/account lanes: SKIP because owner/session behavior was not changed.
