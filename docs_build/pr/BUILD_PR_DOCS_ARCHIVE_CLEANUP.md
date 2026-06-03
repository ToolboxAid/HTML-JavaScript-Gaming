# BUILD PR DOCS ARCHIVE CLEANUP

## Objective
Execute a non-destructive archive pass for legacy PR markdown files so the active `docs_build/pr/` surface only carries the current Level 11 working set.

## Exact Scope
1. Create `docs_build/archive/pr/legacy-pr-history/` if missing.
2. Move the exact files in `docs/reference/features/docs-system/move-history-preserved.md` from `docs_build/pr/` to `docs_build/archive/pr/legacy-pr-history/`.
3. Leave the exact files in `docs/reference/features/docs-system/move-history-preserved.md` in place.
4. Preserve `docs_build/pr/.keep`.
5. Do not modify file contents while moving.

## Constraints
- One PR purpose only.
- File moves only.
- No deletes.
- No renames other than path relocation.
- No changes in `docs_build/dev/start_of_day/`.
- No changes in `docs/roadmaps/`.
- No code/runtime changes.

## Execution Notes
- This is a user-approved execute step for archive moves.
- Preserve filenames exactly.
- Use the manifest as the source of truth; do not broaden scope.

## Validation
- Count of moved PR markdown files: 414.
- Count of retained active PR markdown files: 27.
- `docs_build/pr/` after execution contains only the keep-manifest files plus `.keep`.
- `docs_build/archive/pr/legacy-pr-history/` contains every moved manifest file.
- Git diff should show path moves only for archived PR files and the new archive README/manifests/docs in this bundle.
