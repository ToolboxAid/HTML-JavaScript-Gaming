# PLAN PR DOCS ARCHIVE CLEANUP

## Objective
Reduce active documentation noise by archiving legacy PR documents while preserving current Level 11 work, roadmap safety, and start-of-day protections.

## Bundle Phase
Combined PLAN + BUILD bundle for one PR purpose only: docs archive cleanup.

## Why now
- `docs/pr/` currently contains 441 markdown records.
- Only the active Level 11 lineage is needed in the live PR folder for current repo work.
- Archiving legacy PR records preserves history without keeping the active PR directory noisy.

## In Scope
- Create archive destination under `docs/archive/pr/legacy-pr-history/`.
- Move 414 legacy PR markdown files from `docs/pr/` into the archive destination.
- Keep 27 active Level 11 files in `docs/pr/`.
- Preserve `docs/pr/.keep`.
- Do not delete files.

## Out of Scope
- No deletions.
- No roadmap wording changes.
- No edits inside `docs/dev/start_of_day/`.
- No engine/runtime/code changes.
- No restructuring outside the stated PR/archive paths.

## Keep Rules
Keep these live in `docs/pr/`:
- All `PLAN_PR_LEVEL_11_*`
- All `BUILD_PR_LEVEL_11_*`
- All `APPLY_PR_LEVEL_11_*`
- All `LEVEL_11_*`
- `docs/pr/.keep`

## Move Rules
Archive every other markdown file currently under `docs/pr/` into:
- `docs/archive/pr/legacy-pr-history/`

## Acceptance Criteria
- `docs/archive/pr/legacy-pr-history/` exists.
- Every file listed in `docs/dev/reports/docs_archive_pr_move_manifest.txt` is moved there.
- Every file listed in `docs/dev/reports/docs_archive_pr_keep_manifest.txt` remains in `docs/pr/`.
- `docs/pr/.keep` remains.
- No files inside `docs/dev/start_of_day/` are touched.
- No files inside `docs/roadmaps/` are changed.
- No deletions are performed.

## Rollback
If needed, move the archived PR markdown files back from `docs/archive/pr/legacy-pr-history/` to `docs/pr/` using the same manifest in reverse.
