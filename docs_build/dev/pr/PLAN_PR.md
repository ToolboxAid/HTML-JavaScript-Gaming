# PLAN_PR: PR_26177_OWNER_007-project-instructions-single-source-eod-lock

## Purpose

Make `docs_build/dev/ProjectInstructions/` the only active Project Instructions source and add EOD main lock plus next-day reset governance.

## Scope

- Audit ProjectInstructions and project instructions duplicates.
- Delete duplicate active instruction files from `docs_build/dev/` root.
- Delete stale one-off PR/restart files from `docs_build/dev/` root.
- Move PR-specific docs from `docs_build/dev/` root into `docs_build/dev/pr/`.
- Move active governance/contract docs from `docs_build/dev/` root into `docs_build/dev/ProjectInstructions/addendums/`.
- Move audit outputs from `docs_build/dev/` root into `docs_build/dev/reports/audits/`.
- Delete stale one-off bundle metadata from `docs_build/dev/` root.
- Preserve historical ProjectInstructions-style sources only as deprecated reference material.
- Keep `project-instructions/` out of the PR except for a tiny deprecated pointer.
- Move active legacy addendums into `docs_build/dev/ProjectInstructions/addendums/`.
- Update active team start and governance docs to reference only `docs_build/dev/ProjectInstructions/`.
- Add EOD main lock, next-day reset, team PR branch creation gate, and canonical START / WORK / END branch lifecycle rules.
- Add required Codex reports under `docs_build/dev/reports/`.

## Out Of Scope

- No product/runtime changes.
- No feature work.
- No `start_of_day` changes.
- No legacy SQLite file changes.

## Validation Plan

1. Run targeted grep/search proving no active duplicate ProjectInstructions source remains.
2. Confirm duplicate active root instruction files and stale one-off root files are absent.
3. Confirm `project-instructions/**` has no PR changes except the tiny deprecated pointer.
4. Confirm docs_build/dev root no longer contains active loose instruction, audit, contract, or PR files.
5. Confirm moved active governance/contract docs are under `docs_build/dev/ProjectInstructions/addendums/`.
6. Confirm moved audit outputs are under `docs_build/dev/reports/audits/`.
7. Confirm EOD/Next Day and canonical START / WORK / END branch lifecycle rules appear in active governance docs.
8. Confirm no product/runtime files changed.
9. Run `git diff --check`.
