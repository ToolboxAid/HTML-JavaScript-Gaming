# PLAN PR_26175_OWNER_050-project-instructions-add-valid-reference-files

Source of truth: user request `PLAN_PR PR_26175_OWNER_050-project-instructions-add-valid-reference-files`.

## Purpose
Update Project Instructions governance so `Installs required.txt` and `Table layout.txt` are recognized as valid project instruction/reference files.

## Scope
Primary target files:
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/README.txt`
- `docs_build/dev/ProjectInstructions/addendums/project_reference_files.md`
- `docs_build/dev/ProjectInstructions/addendums/release_gate.md`
- `docs_build/dev/admin-notes/index.txt`
- `docs_build/dev/admin-notes/Installs required.txt`
- `docs_build/dev/admin-notes/Table layout.txt`
- `project-instructions/addendums/codex-project-instructions-startup.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_branch-validation.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_requirement-checklist.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_validation-lane.md`
- `docs_build/dev/reports/PR_26175_OWNER_050-project-instructions-add-valid-reference-files_manual-validation-notes.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required Changes
- Add `Installs required.txt` as a valid project instruction/reference file.
- Add `Table layout.txt` as a valid project instruction/reference file.
- Update documentation so future Project Instructions reviews include these files automatically.
- Treat these files the same as existing instruction documents when found in `ProjectInstructions.zip`, the project instruction directory, or `docs_build/dev/admin-notes/`.
- Preserve the files as documentation/reference material only.

## Acceptance Criteria
- New Project Reference Files Governance addendum exists and is indexed.
- Both recognized filenames are listed in active instruction/governance review surfaces.
- Both canonical admin-note reference files exist.
- Required PR report, branch validation, requirement checklist, validation lane report, manual validation notes, `codex_review.diff`, and `codex_changed_files.txt` exist.
- Delta ZIP exists under `tmp/`.
- No runtime code changes.
- No UI changes.

## Validation
Run only:
- `git status --short --branch`
- `git rev-list --left-right --count origin/main...HEAD`
- `git diff --name-only`
- `git diff --check`
- Targeted reference checks for `Installs required.txt`, `Table layout.txt`, and `project_reference_files.md`.

## Non-goals
- No runtime code changes.
- No UI changes.
- No engine core changes.
- No backlog changes.
- No roadmap changes.
- No broad Project Instructions rewrite.
