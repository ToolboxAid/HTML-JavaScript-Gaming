# BUILD PR_26169_028 Admin Owner Notes Source

## Purpose

Correct the PR_26169_027 Notes restoration so Admin/Owner Notes uses `docs_build/dev/admin-notes/` as the source of truth instead of behaving like a standalone Owner Notes placeholder.

## Scope

- Notes must use `docs_build/dev/admin-notes/` as the source of truth.
- Notes must not create or use a second notes storage location.
- Notes must be available from the Owner menu.
- If Admin menu should also expose Notes based on existing prior behavior, wire it there too.
- The Notes UI must list available note files from `docs_build/dev/admin-notes/`.
- The Notes UI must allow reading selected note content.
- Preserve all existing note files and content.
- If `owner/notes.html` was introduced only as a duplicate placeholder, either remove it or convert it into the correct notes viewer route.
- Do not duplicate notes content into HTML or JavaScript constants.
- Do not move or rename `docs_build/dev/admin-notes/`.
- Do not modify unrelated Admin/Owner menu items.
- Do not change legal, billing, marketplace, membership, AI credit, or storage behavior.

## Implementation Guidance

- Inspect PR_26169_027 changes before editing.
- Inspect existing `docs_build/dev/admin-notes/` directory and prior notes references.
- Use an API/service route if browser code cannot directly list `docs_build/dev/admin-notes/`.
- If a local API route is needed, keep it dev/admin scoped and read-only unless existing prior behavior supported edits.
- Missing `docs_build/dev/admin-notes/` must show an actionable diagnostic.
- Empty `docs_build/dev/admin-notes/` must show an empty-state message, not a failure.
- Note file list must be deterministic and sorted alphabetically.
- Do not expose arbitrary filesystem access.
- Restrict reads to `docs_build/dev/admin-notes/` only.

## Validation

- Verify current branch is `main`.
- Run `node --check` for all touched JavaScript files.
- Run targeted Notes source validation:
  - `docs_build/dev/admin-notes/` exists.
  - Notes list reads from `docs_build/dev/admin-notes/`.
  - Selected note content renders from that directory.
  - Missing directory produces visible diagnostic.
  - Empty directory produces empty state.
  - Path traversal attempts are rejected.
- Run targeted Owner/Admin navigation validation if navigation is touched.
- Run Playwright if Notes UI behavior changes.
- Do not run full samples smoke.
- Stop on failure.

## Required Reports

- `docs_build/pr/BUILD_PR_26169_028-admin-owner-notes-source.md`
- `docs_build/dev/reports/PR_26169_028-admin-owner-notes-source.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- Repo-structured ZIP artifact in `tmp/`.
