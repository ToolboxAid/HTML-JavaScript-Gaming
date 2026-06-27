# PR_26158_043 Admin Notes Local Viewer Restore Report

## Summary

Restored a dev-runtime-only Admin Notes viewer at `src/dev-runtime/admin/admin-notes.html`. The viewer loads `docs_build/dev/admin-notes/index.txt` by default, lists live folders/files from `docs_build/dev/admin-notes/`, and opens selected `.txt` notes without exposing Admin Notes from public or production navigation.

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation. | PASS |
| Restore prior Admin Notes local viewer behavior with default `index.txt`. | `src/dev-runtime/admin/admin-notes.html`; `src/dev-runtime/admin/admin-notes-viewer.js`; Playwright default-load assertion. | PASS |
| Show folders and file names from `docs_build/dev/admin-notes/`. | `src/dev-runtime/admin/admin-notes-directory.mjs` safely lists live root folder entries; Playwright validates folder/file links. | PASS |
| Read and display selected `.txt` note content. | Playwright opens `quick-reference.txt` and `other/index.txt`. | PASS |
| Keep implementation dev-only under `src/dev-runtime/admin/`. | Viewer page, viewer JS, and directory handler live under `src/dev-runtime/admin/`. | PASS |
| Remove Admin Notes hardcoded link from `assets/theme-v2/partials/header-nav.html`. | Header link removed; static audit returns no Admin Notes matches in public/header paths. | PASS |
| Do not expose Admin Notes from production/public navigation. | Boundary test and static audit over `account admin assets toolbox src/engine src/shared`. | PASS |
| Add local/dev-only access through the dev/admin local entrypoint only. | Local entrypoint is `/src/dev-runtime/admin/admin-notes.html`; no public nav or Admin menu link was added. | PASS |
| Do not add fallbacks. | Viewer uses explicit fetches and shows existing visible diagnostics when files/listing are unavailable; no alternate source or hidden default was added. | PASS |
| Do not modify `start_of_day` folders. | `git diff --name-only \| rg "(^|/)start_of_day(/|$)"` returned no matches. | PASS |
| Run changed-file syntax checks. | `node --check` lane passed for changed JS/MJS files. | PASS |
| Run targeted Admin Notes local viewer validation. | `npx playwright test tests/playwright/tools/AdminNotesLocalViewer.spec.mjs` passed. | PASS |
| Verify `docs_build/dev/admin-notes/index.txt` displays by default. | Playwright title/status/content assertions. | PASS |
| Verify folder/file selection displays selected note content. | Playwright clicks `quick-reference.txt` and `other/`. | PASS |
| Verify header nav no longer links directly to `docs_build/dev/admin-notes/`. | Boundary test and `rg` exposure audit. | PASS |
| Verify UAT/PROD paths do not import `src/dev-runtime/admin/`. | Static import audit returned no matches. | PASS |
| Do not run full samples smoke unless directly impacted. | Skipped; no sample loader/framework or sample data changed. | PASS |

## Changed Files

| File | Purpose |
| --- | --- |
| `src/dev-runtime/admin/admin-notes.html` | Dev-runtime local viewer entrypoint. |
| `src/dev-runtime/admin/admin-notes-viewer.js` | Points note/file links at the dev-runtime viewer and fetches repo-root note files. |
| `src/dev-runtime/admin/admin-notes-directory.mjs` | Safely lists live Admin Notes folders/files under `docs_build/dev/admin-notes/`. |
| `src/dev-runtime/server/local-api-server.mjs` | Wires the local server to the Admin Notes directory handler. |
| `tests/helpers/playwrightRepoServer.mjs` | Wires the Playwright local server to the same dev-only directory handler. |
| `assets/theme-v2/partials/header-nav.html` | Removes the direct Admin Notes menu link. |
| `assets/theme-v2/js/gamefoundry-partials.js` | Removes the direct Admin Notes route map entry. |
| `docs_build/dev/admin-notes/README.md` | Documents the restored dev-runtime-only viewer boundary. |
| `tests/dev-runtime/AdminNotesBoundary.test.mjs` | Enforces no public/prod exposure and dev-runtime placement. |
| `tests/playwright/tools/AdminNotesLocalViewer.spec.mjs` | Validates default load, live directory links, and selected note rendering. |
| `tests/playwright/tools/LoginSessionMode.spec.mjs` | Removes the PR042 expectation that Admin navigation exposes Admin Notes. |

## Validation Evidence

| Validation | Result |
| --- | --- |
| Changed-file `node --check` lane | PASS |
| `node --test tests/dev-runtime/AdminNotesBoundary.test.mjs` | PASS, 3/3 |
| `npx playwright test tests/playwright/tools/AdminNotesLocalViewer.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Local users unlock their allowed Account and Admin pages"` | PASS |
| `npx playwright test tests/playwright/tools/RootToolsFutureState.spec.mjs --grep "common header renders primary navigation order across active pages"` | PASS |
| Public navigation exposure audit | PASS, no matches |
| UAT/PROD dev-runtime admin import audit | PASS, no matches |
| `git diff --check` | PASS, line-ending warnings only |

## Playwright Impact

Playwright impacted: Yes. This PR restores a local viewer page, file selection behavior, and live directory-listing behavior. Expected pass behavior is that the viewer loads `index.txt`, lists current folder entries, and opens selected note content. Expected fail behavior is missing default content, missing folder/file links, or selected note clicks failing to update the content/status.

## Manual Test Notes

1. Start the API-backed local server.
2. Open `/src/dev-runtime/admin/admin-notes.html`.
3. Confirm `index.txt` content loads by default.
4. Click `quick-reference.txt` and `other/`; each should display that selected note content.
5. Confirm the public/Admin header menus do not contain an Admin Notes link.

## Skipped Lanes

- Full samples smoke: skipped because samples and game runtime were not touched.
- Full Playwright suite: skipped because targeted Admin Notes, header, and auth/menu lanes cover the changed behavior.
