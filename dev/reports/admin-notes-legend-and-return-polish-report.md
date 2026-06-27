# PR_26156_188 Admin Notes Legend And Return Polish Report

## Result
PASS

## Summary
- Changed Status Legend from a vertical list to one side-by-side Theme V2 action row.
- Removed legend hover/title attributes while preserving status marker icon rendering.
- Removed the old top `Return to index.txt` link.
- Added `Return to root index` to the Current Folder header row.
- Kept Current Folder file/folder links below the rendered note content.

## Scope Controls
- No archived V1/V2 files changed.
- No `start_of_day` files changed.
- No page-local CSS, inline styles, `<style>` blocks, inline event handlers, or inline `<script>` blocks added.
- No new CSS was added; existing Theme V2/Admin classes are used.
- No full samples smoke was run.

## Latest Admin Notes Context
- Built on the current Admin Notes directory-link and legend implementation from PR_26156_187.
- Preserved simple subnote links, labeled root-relative file links, orange note links, current-folder links, traversal rejection, and visible missing-file errors.

## Runtime Behavior Verified
- Status Legend appears side by side on one row: PASS.
- Legend has no hover/title behavior: PASS.
- Old top `Return to index.txt` element is removed: PASS.
- `Return to root index` appears to the right of the Current Folder H3: PASS.
- `Return to root index` appears on root, subnote, linked-file, missing-file, and rejected-path views: PASS.
- `Return to root index` opens the root `docs_build/dev/admin-notes/index.txt`: PASS.
- Status markers `[ ]`, `[.]`, `[x]`, `[!]`, and `[?]` still render as icons: PASS.
- Current-folder links still render and open folder/text targets: PASS.
- Traversal attempts are rejected before fetch: PASS.

## Notes
- Parser status icons retain their existing title/ARIA behavior; only legend hover/title behavior was removed per BUILD.
- The Current Folder section remains visible even when a folder has no additional file/folder links so the root return is always available.
