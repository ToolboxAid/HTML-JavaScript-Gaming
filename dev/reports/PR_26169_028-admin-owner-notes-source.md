# PR_26169_028 Admin Owner Notes Source

## Summary

Corrected Owner Notes so it uses the existing Admin Notes viewer pattern and `docs_build/dev/admin-notes/` as the source of truth. The previous Owner placeholder content was replaced with a directory-backed reader, while the existing dev-runtime Admin Notes route remains available.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Notes use `docs_build/dev/admin-notes/` as source of truth. | PASS | `owner/notes.html` loads the shared viewer; Playwright verifies `index.txt` and `sample.txt` content from the directory. |
| Do not create or use a second notes storage location. | PASS | No new notes directory or copied note content was added. |
| Notes available from Owner menu. | PASS | Existing Owner navigation SSoT still points `Notes` to `owner/notes.html`; targeted navigation tests pass. |
| Admin menu exposure based on existing behavior. | PASS | Current shared Admin menu remains operations-only; existing local Admin viewer route remains available at `/admin/admin-notes.html`. |
| UI lists available note files. | PASS | Playwright validates root folder/file links from `docs_build/dev/admin-notes/`. |
| UI reads selected note content. | PASS | Playwright opens `sample.txt` and `other/index.txt` from the source folder. |
| Preserve existing note files/content. | PASS | No files under `docs_build/dev/admin-notes/` were changed. |
| Convert/remove duplicate placeholder. | PASS | `owner/notes.html` was converted from the Game Journey placeholder into the correct viewer route. |
| No duplicated note content in HTML/JS constants. | PASS | HTML/JS contain only path labels/status text, not copied note bodies. |
| Do not move/rename `docs_build/dev/admin-notes/`. | PASS | Directory location unchanged. |
| Restrict reads to `docs_build/dev/admin-notes/`. | PASS | API handler rejects traversal and non-admin-notes folders. |
| Missing directory visible diagnostic. | PASS | Playwright negative-path test verifies the visible missing-directory message. |
| Empty directory empty state. | PASS | Playwright verifies the empty-state message with no folder/file links. |
| Deterministic sorted list. | PASS | Node handler test verifies alphabetical ordering. |

## Implementation Notes

- Added a read-only `/api/dev/admin-notes/directory?folder=...` route backed by the existing Admin Notes directory handler.
- Kept the legacy `?adminNotesDirectory=1` route working for the existing local Admin Notes viewer behavior.
- Updated the viewer to resolve directory listings through the configured browser-safe API URL, while continuing to load selected `.txt` files by root-relative path.
- Updated the viewer link generation so Owner route navigation stays under `/owner/notes.html`.
- Converted `owner/notes.html` into an Owner-protected Admin/Owner Notes viewer shell with the existing Owner menu.

## Validation

| Command | Result |
| --- | --- |
| `git branch --show-current` | PASS, `main`. |
| `node --check src/dev-runtime/admin/admin-notes-directory.mjs` | PASS |
| `node --check src/dev-runtime/admin/admin-notes-viewer.js` | PASS |
| `node --check src/dev-runtime/server/local-api-router.mjs` | PASS |
| `node --check src/dev-runtime/server/local-api-server.mjs` | PASS |
| `node --check tests/helpers/playwrightRepoServer.mjs` | PASS |
| `node --check tests/dev-runtime/AdminNotesBoundary.test.mjs` | PASS |
| `node --check tests/playwright/tools/AdminNotesLocalViewer.spec.mjs` | PASS |
| `node --check tests/playwright/tools/AdminOwnerNavigationBoundary.spec.mjs` | PASS |
| `node --test tests/dev-runtime/AdminNotesBoundary.test.mjs` | PASS, 8/8 |
| `node --test tests/dev-runtime/ApiMenuPathCleanup.test.mjs` | PASS, 6/6 |
| `npx playwright test tests/playwright/tools/AdminNotesLocalViewer.spec.mjs tests/playwright/tools/AdminOwnerNavigationBoundary.spec.mjs --workers=1` | PASS, 9/9 after updating the expected console noise for the intentional 404 diagnostic case. |
| `git diff --check` | PASS, CRLF notices only. |

## Coverage

Playwright V8 coverage was generated in `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

- `src/dev-runtime/admin/admin-notes-viewer.js`: 96%, executed lines 533/533.
- Node server modules changed for the directory API are advisory warnings in browser V8 coverage because they are not browser-collected runtime scripts.

## Files Changed

- `docs_build/pr/BUILD_PR_26169_028-admin-owner-notes-source.md`
- `docs_build/dev/reports/PR_26169_028-admin-owner-notes-source.md`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `owner/notes.html`
- `src/dev-runtime/admin/admin-notes-directory.mjs`
- `src/dev-runtime/admin/admin-notes-viewer.js`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/dev-runtime/server/local-api-server.mjs`
- `tests/dev-runtime/AdminNotesBoundary.test.mjs`
- `tests/helpers/playwrightRepoServer.mjs`
- `tests/playwright/tools/AdminNotesLocalViewer.spec.mjs`
- `tests/playwright/tools/AdminOwnerNavigationBoundary.spec.mjs`

## Notes

- Full samples smoke was not run, per BUILD scope.
- Existing note files in `docs_build/dev/admin-notes/` were left untouched.
