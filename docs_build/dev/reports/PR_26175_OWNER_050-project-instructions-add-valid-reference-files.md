# PR_26175_OWNER_050-project-instructions-add-valid-reference-files

Date: 2026-06-24
Team: OWNER
Scope: Documentation/governance only
Status: PASS

## Summary

- Added Project Reference Files Governance for recognized project instruction/reference documents.
- Recognized `Installs required.txt` and `Table layout.txt` when present in `ProjectInstructions.zip`, the active project instruction directory, or `docs_build/dev/admin-notes/`.
- Indexed the new addendum from the active Project Instructions README and operating-system root.
- Updated the release gate, legacy startup guidance, root enforcement instructions, and admin-note ownership list so future reviews include these files automatically.
- Added the two canonical admin-note reference files.
- No runtime code changes and no UI changes were made.

## Branch Validation

PASS. Current branch is `codex/pr-26175-owner-050-project-instructions-add-valid-reference-files`, created from clean synchronized `main` at `99c53e368`.

## Instruction Compliance

- PASS: PR name includes OWNER team token.
- PASS: Team OWNER owns governance/instruction-routing work.
- PASS: Scope is documentation/governance only.
- PASS: No runtime, UI, engine, backlog, or roadmap changes.
- PASS: Required reports and ZIP artifact are produced for the BUILD.

## Changed Files

- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/README.txt`
- `docs_build/dev/ProjectInstructions/addendums/project_reference_files.md`
- `docs_build/dev/ProjectInstructions/addendums/release_gate.md`
- `docs_build/dev/admin-notes/index.txt`
- `docs_build/dev/admin-notes/Installs required.txt`
- `docs_build/dev/admin-notes/Table layout.txt`
- `project-instructions/addendums/codex-project-instructions-startup.md`
- `docs_build/pr/PLAN_PR_26175_OWNER_050-project-instructions-add-valid-reference-files.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_branch-validation.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_requirement-checklist.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_validation-lane.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_manual-validation-notes.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_branch-validation.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_requirement-checklist.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_validation-lane.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_manual-validation-notes.md`

## Validation

- PASS: `git status --short --branch`.
- PASS: `git rev-list --left-right --count origin/main...HEAD`.
- PASS: `git diff --name-only`.
- PASS: `git diff --check`.
- PASS: Targeted reference checks confirmed both filenames and the new addendum are referenced from active instruction surfaces.
- PASS: File presence checks confirmed both canonical admin-note reference files exist.

## Artifact

- `tmp/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_delta.zip`
