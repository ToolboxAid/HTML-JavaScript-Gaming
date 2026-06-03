# PLAN_PR_10_26_REPO_DUPLICATE_FILE_CONTENT_AUDIT

## Purpose
Add a repo-wide duplicate file content audit so identical files can be identified and classified before cleanup.

## Scope
- Scan repository files by content hash.
- Report exact byte-identical duplicates.
- Classify likely duplicate categories:
  - live SSoT duplicates
  - report/evidence snapshots
  - generated validation artifacts
  - build/tmp outputs
  - intentional template duplicates
  - accidental duplicate source/data files
- Do not delete or move files in this PR.
- Do not modify start_of_day folders.

## Acceptance
- A duplicate-content report is generated under docs_build/dev/reports.
- Report includes hash, file size, duplicate count, and repo-relative file paths.
- Report excludes noisy dependency/build/cache folders unless explicitly needed.
- Report identifies high-risk duplicate SSoT candidates.
- No file cleanup happens yet.
