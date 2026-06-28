# PR_26179_OWNER_010-canonical-project-folder-instructions

Updated: 2026-06-28T02:02:53Z
Team: OWNER
Branch: PR_26179_OWNER_010-canonical-project-folder-instructions
Scope: Documentation/governance only. No runtime code, production pages, or wrapper scripts changed. Repo folders outside ProjectInstructions were not moved.

## Summary
- Tightened `PROJECT_INSTRUCTIONS.md` into the only manual Project Instructions entry point.
- Reduced `PROJECT_INSTRUCTIONS.md` to purpose, version/date, required read order, load graph, stop gates, execution modes, and pointers.
- Moved canonical folder placement and bootstrap documents into dedicated `repository/` and `bootstrap/` buckets under ProjectInstructions.
- Converted `PROJECT_STATE.md` into a machine-friendly state document with the required metadata fields and no backlog tasks.
- Reduced `README.txt`, retired startup guidance, and retired repository directory standard content to pointer/superseded references.

## SSoT Decisions
- Manual entry point SSoT: `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md`.
- Project state SSoT: `dev/build/ProjectInstructions/PROJECT_STATE.md`.
- Folder placement SSoT: `dev/build/ProjectInstructions/repository/canonical_repository_structure.md`.
- Bootstrap/startup SSoT: `dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md`.
- Retired pointer docs: `README.txt`, `addendums/codex_project_instructions_startup.md`, and `addendums/repository_directory_standard.md`.

## Moved Docs
- `dev/build/ProjectInstructions/addendums/codex_start_of_day_bootstrap.md` -> `dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md`.
- `dev/build/ProjectInstructions/addendums/canonical_repository_structure.md` -> `dev/build/ProjectInstructions/repository/canonical_repository_structure.md`.

## Removed Docs
None. Retired docs were retained only as short pointers where references may still exist.

## Changed Files
```
M	dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md
M	dev/build/ProjectInstructions/PROJECT_STATE.md
M	dev/build/ProjectInstructions/README.txt
M	dev/build/ProjectInstructions/TEAM_START_COMMANDS.md
M	dev/build/ProjectInstructions/addendums/codex_project_instructions_startup.md
M	dev/build/ProjectInstructions/addendums/release_gate.md
M	dev/build/ProjectInstructions/addendums/repository_directory_standard.md
R064	dev/build/ProjectInstructions/addendums/codex_start_of_day_bootstrap.md	dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md
R100	dev/build/ProjectInstructions/addendums/canonical_repository_structure.md	dev/build/ProjectInstructions/repository/canonical_repository_structure.md
M	dev/reports/codex_changed_files.txt
M	dev/reports/codex_review.diff
M	dev/reports/PR_26179_OWNER_010-canonical-project-folder-instructions.md
M	dev/reports/PR_26179_OWNER_010-canonical-project-folder-instructions_requirement-checklist.md
M	dev/reports/PR_26179_OWNER_010-canonical-project-folder-instructions_validation-report.md
```

## Duplicate Guidance Review
- Bootstrap/startup guidance SSoT check: PASS. Full bootstrap responsibilities remain only in `bootstrap/codex_start_of_day_bootstrap.md`; the retired startup document is a pointer.
- Folder ownership SSoT check: PASS. Full folder placement rules remain in `repository/canonical_repository_structure.md`.
- Intentional non-SSoT references: `PROJECT_STATE.md` carries machine-readable current folder fields, and the bootstrap doc carries short SSoT summary pointers only.

## Validation
- `git diff --check`: PASS.
- `npm run validate:canonical-structure`: PASS.
- `node ./dev/scripts/run-platform-validation-suite.mjs`: PASS, 8/8 scenarios.
- Grep for duplicate bootstrap/startup guidance: PASS.
- Grep for duplicate full folder ownership tables outside canonical SSoT: PASS, only intentional state/summary references found.

## Blockers
None.
