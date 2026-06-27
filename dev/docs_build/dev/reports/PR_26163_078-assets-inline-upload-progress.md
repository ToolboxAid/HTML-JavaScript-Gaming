# PR_26163_078-assets-inline-upload-progress

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before changes.
- PASS: Added upload directory validation before file writes in `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`.
- PASS: Upload path resolution now validates project id, asset type folder, target directory, and target file path under `projects/<projectId>/<asset-type>/`.
- PASS: Missing target directories under `projects/<projectId>/<asset-type>/` are created before file write.
- PASS: Directory creation/validation failures return visible FAIL diagnostics and do not create asset records.
- PASS: Path traversal or resolved paths outside the current project asset folder fail before write.
- PASS: Upload diagnostics include target directory and directory result/status.
- PASS: Inline upload progress remains under upload-capable asset accordion tables.
- PASS: Sprite, Vector, and Palette References remain reference-only for MVP.
- PASS: `codex_review.diff` generation path is preserved as UTF-8 readable text.
- PASS: Full samples smoke was not run.

## Directory Validation Evidence

- Created directory evidence: Playwright validates upload creates `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/` when missing, then writes `write-view-image.png`.
- Existing directory evidence: duplicate upload validation shows `Directory exists: projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image.` and blocks the duplicate record.
- Failed directory evidence: targeted escape-path validation shows `target path must stay under /projects/<projectId>/`, `Write result: FAIL: Directory validation`, and `Directory status: failed`.
- Asset record creation evidence: tests verify record count stays `0` when directory validation fails and increases only after a successful directory validation plus file write.

## Project Path Evidence

- Stored upload path remains full project-relative path: `projects/<projectId>/image/<filename>`.
- Preview display remains asset-type-relative in tables: `image/<filename>`.
- Physical file write validation checked `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/write-view-image.png` exists and contains the selected bytes.

## Upload Progress Evidence

- Inline progress is rendered under the Images asset table through `data-asset-tool-inline-upload-progress`.
- Playwright validates current file, file count, bytes uploaded, total bytes, BPS, speed, ETA, elapsed, per-file OK rows, and batch summary in the inline progress panel.
- The existing inspector upload dialog remains intact and mirrors the same upload progress information.

## Changed Files

- `toolbox/assets/assets.js`
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_078-assets-inline-upload-progress.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Impacted Lanes

- runtime: Assets tool browser upload UI and inline progress rendering.
- integration: Assets tool API/mock repository upload persistence path.
- recovery/UAT: targeted Playwright coverage for upload directory validation and progress diagnostics.

## Skipped Lanes

- samples: SKIP. This PR changes the Assets tool upload UI and mock repository write validation only; no sample runtime JSON or sample smoke surface changed.
- engine: SKIP. No `src/engine/input`, render, or game runtime behavior changed.

## Validation Performed

- PASS: `node --check toolbox/assets/assets.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS: `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS: `git diff --check -- toolbox/assets/assets.js src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS: `git diff --check -- .`
- PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --workers=1 --reporter=list`
  - Result: 11 passed.
- PASS: `npm run test:workspace-v2`
  - Result: workspace-contract lane passed, 5 Playwright tests passed.

## Playwright Result

- PASS: Targeted Assets Playwright suite passed 11/11.
- PASS: `npm run test:workspace-v2` passed.

## V8 Coverage

- Coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS: `toolbox/assets/assets.js` collected browser V8 coverage: 96%.
- WARN: `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js` is Node-side repository code and is listed as not collected by Chromium V8 browser coverage. Behavior is covered by targeted Playwright through the server API plus direct repository assertions.

## Manual Validation Steps

1. Open `/toolbox/assets/index.html` in local DB mode.
2. Reset Asset Library.
3. Add Images and select an image file.
4. Confirm inline upload progress appears under the Images table and inspector upload diagnostics also update.
5. Confirm diagnostics show project id, target directory, directory result/status, target file path, write result, and view path.
6. Confirm the uploaded file exists under `projects/<projectId>/image/`.
7. Attempt a duplicate filename and confirm upload fails without adding a duplicate record.

## Samples Validation

- Full samples smoke: SKIP.
- Reason: requested skip, and this PR is scoped to Assets tool upload validation and mock repository file writes.
