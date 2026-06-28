# PR_26179_OWNER_036-reports-are-tracked-source

## Summary

This governance PR clarifies that `dev/reports/` is authoritative tracked repository source. Codex-generated reports are expected to be committed with the PR that generated them, and generated post-merge closeout reports should be committed through a follow-up governance/report PR or avoided on `main` when no commit is intended.

## Scope

- Updated Codex artifact/reporting governance.
- Updated canonical repository structure wording for `dev/reports/`.
- Updated PR workflow clean-main guidance for tracked reports.
- Preserved the existing PR277 post-merge closeout report artifacts instead of deleting them.
- No runtime code changes.
- No auth changes.
- No Local API changes.
- No `.gitignore` changes.

## Policy Added

- `dev/reports/` is authoritative and tracked by Git.
- Any changes to `dev/reports/` generated during a PR are expected to be included in that PR.
- A clean `main` means the latest report files have been committed and merged.
- Do not delete report files only to make the worktree clean.
- Do not add `dev/reports/` to `.gitignore`.
- Do not move reports outside the repository.
- Continue using `dev/reports/` for reports and `dev/workspace/zips/` for ZIPs.
- Generated post-merge closeout reports should either be committed in a follow-up governance/report PR or avoided on `main` if no commit is intended.

## Validation

Pending at report creation; final results are recorded in the validation report.
