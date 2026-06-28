# PR_26171_GAMMA_026-sqlite-test-reference-cleanup

TEAM ownership: Golf.

## Scope

Update remaining test references that still used temporary `.sqlite` names where the test no longer validates SQLite behavior.

## Changes

- Updated neutral Local DB temp state filenames from `.sqlite` to `.local-db-state` in:
  - `tests/dev-runtime/DbSeedIntegrity.test.mjs`
  - `tests/playwright/tools/AdminDbViewer.spec.mjs`
  - `tests/playwright/tools/BrowserApiUrlConfig.spec.mjs`
  - `tests/playwright/tools/GameJourneyTool.spec.mjs`
  - `tests/playwright/tools/LoginSessionMode.spec.mjs`
- Preserved negative assertions that ensure SQLite is not exposed:
  - `tests/playwright/tools/AdminHealthOperationsPage.spec.mjs`
- Preserved explicit legacy SQLite behavior coverage:
  - `tests/playwright/tools/GameJourneyTool.spec.mjs` legacy data guard test.
- Did not modify runtime code.
- Did not touch archive reports.

## Validation

Passed:
- `git diff --check`
- `node --check tests/dev-runtime/DbSeedIntegrity.test.mjs`
- `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- `node --check tests/playwright/tools/BrowserApiUrlConfig.spec.mjs`
- `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`
- `node --check tests/playwright/tools/GameJourneyTool.spec.mjs`
- Targeted text check confirmed primary touched Local DB temp names no longer use `.sqlite`.
- Targeted text check confirmed remaining test SQLite references are only the Admin health negative assertions and the Game Journey legacy SQLite data guard.

Skipped:
- Playwright: skipped because the changes are filename suffix cleanup only and no browser/runtime behavior changed.
- Samples: skipped by request and no sample files changed.
- Archive/history cleanup: explicitly out of scope.

## Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_GAMMA_026-sqlite-test-reference-cleanup.md`
- `docs_build/dev/reports/PR_26171_GAMMA_026-sqlite-test-reference-cleanup-manual-validation-notes.md`
- `docs_build/dev/reports/PR_26171_GAMMA_026-sqlite-test-reference-cleanup-instruction-compliance-checklist.md`

## ZIP

`tmp/PR_26171_GAMMA_026-sqlite-test-reference-cleanup_delta.zip`
