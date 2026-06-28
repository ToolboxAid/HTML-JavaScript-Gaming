# PR_26179_OWNER_036-reports-are-tracked-source

## Summary

This governance PR clarifies that `dev/reports/` contains the authoritative Codex reports for the repository and that reports committed to `main` are the official record. Reports generated during a PR are expected to be committed as part of that PR, while repository authority remains the report state committed to `main`.

## Scope

- Updated Codex artifact/reporting governance.
- Updated canonical repository structure wording for `dev/reports/`.
- Updated PR workflow clean-main guidance for intended report updates.
- Preserved the existing PR277 post-merge closeout report artifacts instead of deleting them.
- No runtime code changes.
- No auth changes.
- No Local API changes.
- No `.gitignore` changes.

## Policy Added

- `dev/reports/` contains the authoritative Codex reports for the repository.
- Reports committed to `main` are the official record.
- Reports generated during a PR are expected to be committed as part of that PR.
- Once merged into `main`, those report versions become the canonical repository history.
- Do not delete report files solely to obtain a clean worktree.
- Do not add `dev/reports/` to `.gitignore`.
- Continue storing ZIPs under `dev/workspace/zips/`.

## Validation

PASS:

- `git diff --check`
- `npm run validate:canonical-structure`
