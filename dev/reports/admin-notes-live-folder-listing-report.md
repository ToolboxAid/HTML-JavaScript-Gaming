# Admin Notes Live Folder Listing Report

Task: PR_26156_191-admin-notes-live-folder-listing

## Implementation

- Replaced Admin Notes tracked directory-index lookup with live filesystem-backed directory listing.
- Deleted `docs_build/dev/admin-notes/directory-index.json`; Admin Notes no longer maintains a tracked list of note folders/files.
- Added a narrow local/dev server listing response for `docs_build/dev/admin-notes/` folders only.
- Current Folder now fetches directory entries every time the Admin Notes page loads or the route changes.
- Folder entries link to that folder's `index.txt`.
- Supported `.txt` files link directly through the existing root-relative file route.
- Listing traversal remains restricted to `docs_build/dev/admin-notes/`.
- Existing approved root-relative text-file links still open, but their outside folders are not listed.
- Added `Open folder` on the same row as `Current Folder` and `Return to root index`.
- `Open folder` targets the folder containing the current Admin Notes document and shows a visible diagnostic if folder opening requires local file/dev-server mode.

## Validation

- `node --check admin/notes.js` - PASS.
- `node --check tests/helpers/playwrightRepoServer.mjs` - PASS.
- `node --check tests/playwright/tools/AdminNotesViewer.spec.mjs` - PASS.
- Changed-file guard grep for inline CSS/script handlers, tracked directory-index references, archived V1/V2 references, and start_of_day references - PASS.
- `npx playwright test tests/playwright/tools/AdminNotesViewer.spec.mjs --workers=1` - PASS, 4 tests.
- `npm run test:playwright:static` - PASS.

## Targeted Coverage

- Verified manually added folder appears in Current Folder without code changes.
- Verified manually added text file appears in Current Folder without code changes.
- Verified folder links open folder `index.txt` when present.
- Verified file links open supported text files.
- Verified Open folder points to the current document folder, not the file.
- Verified Return to root index still works.
- Verified traversal attempts are rejected.

Full samples smoke was not run, per request.
