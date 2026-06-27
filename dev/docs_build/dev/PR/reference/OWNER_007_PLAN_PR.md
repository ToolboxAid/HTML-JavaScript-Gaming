# PLAN_PR: PR_26177_OWNER_007-project-instructions-single-source-eod-lock

## Purpose

Make `dev/docs_build/dev/ProjectInstructions/` the only active Project Instructions source and add EOD main lock plus next-day reset governance.

## Scope

- Audit ProjectInstructions and project instructions duplicates.
- Delete duplicate active instruction files from `dev/docs_build/dev/` root.
- Delete stale one-off PR/restart files from `dev/docs_build/dev/` root.
- Move PR-specific docs from `dev/docs_build/dev/` root into `dev/docs_build/dev/pr/`.
- Move active governance/contract docs from `dev/docs_build/dev/` root into `dev/docs_build/dev/ProjectInstructions/addendums/`.
- Move audit outputs from `dev/docs_build/dev/` root into `dev/reports/audits/`.
- Delete stale one-off bundle metadata from `dev/docs_build/dev/` root.
- Add Tool MVP Stacked PR Standard under `dev/docs_build/dev/ProjectInstructions/`.
- Update PR planning/template and report requirements for tool MVP PRs.
- Add No Mock Repository Runtime Source governance under `dev/docs_build/dev/ProjectInstructions/`.
- Update Creator-testable stacked MVP standard to reject mock/page-array/JSON/browser-storage/tmp completion states.
- Move verified old/superseded DoD and roadmap docs to the existing root `dev/archive/` tree.
- Use the existing root `dev/archive/` tree instead of creating `dev/docs_build/dev/archive/` or new `dev/docs_build/dev/ProjectInstructions/dev/archive/` paths.
- Preserve historical ProjectInstructions-style sources only as deprecated reference material.
- Keep `dev/project-instructions/` out of the PR except for a tiny deprecated pointer.
- Move active legacy addendums into `dev/docs_build/dev/ProjectInstructions/addendums/`.
- Update active team start and governance docs to reference only `dev/docs_build/dev/ProjectInstructions/`.
- Add EOD main lock, next-day reset, team PR branch creation gate, and canonical START / WORK / END branch lifecycle rules.
- Add required Codex reports under `dev/reports/`.

## Out Of Scope

- No product/runtime changes.
- No feature work.
- No `start_of_day` changes.
- No legacy SQLite file changes.

## Validation Plan

1. Run targeted grep/search proving no active duplicate ProjectInstructions source remains.
2. Confirm duplicate active root instruction files and stale one-off root files are absent.
3. Confirm `dev/project-instructions/**` has no PR changes except the tiny deprecated pointer.
4. Confirm dev/docs_build/dev root no longer contains active loose instruction, audit, contract, or PR files.
5. Confirm moved active governance/contract docs are under `dev/docs_build/dev/ProjectInstructions/addendums/`.
6. Confirm moved audit outputs are under `dev/reports/audits/`.
7. Confirm Tool MVP Stacked PR Standard appears in active ProjectInstructions.
8. Confirm tool MVP PR template/report requirements include Creator-testable outcome, Playwright tests, Mr. Q manual test, stack membership, and previous/next dependency.
9. Confirm No Mock Repository Runtime Source governance appears in active ProjectInstructions.
10. Confirm Creator-testable stacked MVP standard rejects mock/page-array/JSON/browser-storage/tmp completion states.
11. Confirm listed old/superseded DoD and roadmap docs moved to `dev/archive/docs_build/dev/dod/` and `dev/archive/docs_build/dev/roadmaps/`.
12. Confirm `dev/docs_build/dev/dod/` was removed if empty and `dev/docs_build/dev/roadmaps/` was not removed if unlisted files remain.
13. Confirm active preservation guidance points to root `dev/archive/`.
14. Confirm EOD/Next Day and canonical START / WORK / END branch lifecycle rules appear in active governance docs.
15. Confirm no product/runtime files changed.
16. Run `git diff --check`.
