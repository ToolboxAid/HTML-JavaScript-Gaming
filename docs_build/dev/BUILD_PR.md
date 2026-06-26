# PR_26177_OWNER_007-project-instructions-single-source-eod-lock

## Purpose

Make `docs_build/dev/ProjectInstructions/` the only active Project Instructions source and add EOD main lock plus next-day reset governance.

## Source Of Truth

This `BUILD_PR.md`, `PLAN_PR.md`, and the user request are the source of truth for `PR_26177_OWNER_007-project-instructions-single-source-eod-lock`.

## Exact Scope

- Audit repo for ProjectInstructions / project instructions duplicates.
- Establish `docs_build/dev/ProjectInstructions/` as the only active source.
- Mark all other ProjectInstructions-style sources changed by this PR as deprecated references.
- Update active team start/governance docs to reference only `docs_build/dev/ProjectInstructions/`.
- Add EOD main lock and next-day reset governance.
- Add required reports under `docs_build/dev/reports/`.

## Exact Targets

- `docs_build/dev/PLAN_PR.md`
- `docs_build/dev/BUILD_PR.md`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/README.txt`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/TEAM_START_COMMANDS.md`
- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- `docs_build/dev/ProjectInstructions/addendums/*.md`
- `project-instructions/README.md`
- `project-instructions/addendums/*.md`
- `docs_build/dev/reports/PR_26177_OWNER_007-project-instructions-single-source-eod-lock*.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No product/runtime changes.
- No feature work.
- No `start_of_day` changes.
- No legacy SQLite file changes.

## Validation

Run:

```powershell
rg -n 'project-instructions/addendums|docs_build/dev/PROJECT_INSTRUCTIONS.md.*source of truth|Codex must always read `docs_build/dev/PROJECT_INSTRUCTIONS.md`|Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`' docs_build/dev/ProjectInstructions docs_build/dev/PROJECT_INSTRUCTIONS.md project-instructions
rg -n "End of Day:|Next Day Start:|HEAD.*published EOD SHA|only active Project Instructions source" docs_build/dev/ProjectInstructions
git diff --name-only -- src assets toolbox games api serverside package.json package-lock.json docs_build/dev/start_of_day
git diff --check
```
