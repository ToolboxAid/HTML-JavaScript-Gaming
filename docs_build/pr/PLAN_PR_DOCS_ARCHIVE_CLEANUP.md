# PLAN PR DOCS ARCHIVE CLEANUP

## Objective
Reduce active documentation noise by archiving legacy PR documents while preserving current Level 11 work, roadmap safety, and start-of-day protections.

## Bundle Phase
Combined PLAN + BUILD bundle for one PR purpose only: docs archive cleanup.

## Why now
- `docs_build/pr/` currently contains 441 markdown records.
- Only the active Level 11 lineage is needed in the live PR folder for current repo work.
- Archiving legacy PR records preserves history without keeping the active PR directory noisy.

## In Scope
- Create archive destination under `archive/v1-v2/docs_build/archive/pr/legacy-pr-history/`.
- Move 414 legacy PR markdown files from `docs_build/pr/` into the archive destination.
- Keep 27 active Level 11 files in `docs_build/pr/`.
- Preserve `docs_build/pr/.keep`.
- Do not delete files.

## Out of Scope
- No deletions.
- No roadmap wording changes.
- No edits inside `docs_build/dev/start_of_day/`.
- No src/engine/runtime/code changes.
- No restructuring outside the stated PR/archive paths.

## Keep Rules
Keep these live in `docs_build/pr/`:
- All `PLAN_PR_LEVEL_11_*`
- All `BUILD_PR_LEVEL_11_*`
- All `APPLY_PR_LEVEL_11_*`
- All `LEVEL_11_*`
- `docs_build/pr/.keep`

## Move Rules
Archive every other markdown file currently under `docs_build/pr/` into:
- `archive/v1-v2/docs_build/archive/pr/legacy-pr-history/`

## Acceptance Criteria
- `archive/v1-v2/docs_build/archive/pr/legacy-pr-history/` exists.
- Every file listed in `docs/reference/features/docs-system/move-history-preserved.md` is moved there.
- Every file listed in `docs/reference/features/docs-system/move-history-preserved.md` remains in `docs_build/pr/`.
- `docs_build/pr/.keep` remains.
- No files inside `docs_build/dev/start_of_day/` are touched.
- No files inside `docs/roadmaps/` are changed.
- No deletions are performed.

## Rollback
If needed, move the archived PR markdown files back from `archive/v1-v2/docs_build/archive/pr/legacy-pr-history/` to `docs_build/pr/` using the same manifest in reverse.
