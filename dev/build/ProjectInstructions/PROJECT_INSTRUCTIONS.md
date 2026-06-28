# Project Instructions

## Purpose

`PROJECT_INSTRUCTIONS.md` is the only manual entry point for active Project Instructions.

Codex and future wrappers must request this file directly. All other Project Instructions documents are loaded indirectly through the references below.

## Canonical Source Rule

The repository is the canonical source of truth for project rules.

Codex, ChatGPT, wrappers, and team operators must use the current repository documentation under `dev/build/ProjectInstructions/` as authority for active rules. Prior chat history, remembered conversation context, generated reports, archived documents, local notes, or stale external instructions must not override repository documentation.

If current chat instructions conflict with repository documentation, Codex must follow the active repository documentation or HARD STOP and request OWNER direction.

## Canonical Team Naming

Canonical active teams:

- Owner
- Alfa
- Bravo
- Charlie
- Golf

Official NATO spellings:

```text
Alfa, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel, India, Juliett, Kilo, Lima, Mike, November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform, Victor, Whiskey, Xray, Yankee, Zulu.
```

Rules:

- Use official NATO spelling for all team names.
- Do not use `Alpha`, `Beta`, or `Gamma` for active teams.
- Deprecated or historical names must not be used for active team routing, new work ownership, or current governance.
- Historical PR names, branch names, and references may remain unchanged when they are already merged or clearly referenced as history.
- New branches, PRs, reports, and documentation must use canonical team names.
- Repository documentation overrides prior conversations.

## Current Version/Date

- Project Instructions Version: 2026-06-28.PR_26172_OWNER_034
- Date: 2026-06-28
- Owner: OWNER

## Required Read Order

1. Always read `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md`.
2. Always read `dev/build/ProjectInstructions/PROJECT_STATE.md`.
3. Always read `dev/build/ProjectInstructions/repository/canonical_repository_structure.md`.
4. For Codex workflow command interpretation, read `dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`.
5. For Start of Day, read `dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md`.
6. Load team, backlog, database, runtime, theme, or other specialist documents only when the current task requires them.

## Load Graph

```text
PROJECT_INSTRUCTIONS.md
|-- PROJECT_STATE.md
|-- repository/canonical_repository_structure.md
|-- standards/CODEX_WORKFLOW_COMMANDS.md
|   `-- Start of Day, PLAN_PR, BUILD_PR, APPLY_PR, or command interpretation
|-- bootstrap/codex_start_of_day_bootstrap.md
|   `-- Start of Day only
|-- team/backlog docs
|   `-- Start of Day, planning, or team-specific PRs only
|-- database docs
|   `-- DB, DDL, DML, seed, or API persistence changes only
|-- runtime docs
|   `-- runtime, API, or service changes only
`-- theme docs
    `-- UI, theme, or page changes only
```

## When-To-Load Rules

- `PROJECT_INSTRUCTIONS.md`: always.
- `PROJECT_STATE.md`: always.
- `repository/canonical_repository_structure.md`: always.
- `standards/CODEX_WORKFLOW_COMMANDS.md`: Start of Day, PLAN_PR, BUILD_PR, APPLY_PR, invalid command, or command interpretation tasks.
- `bootstrap/codex_start_of_day_bootstrap.md`: Start of Day only.
- Backlog docs: Start of Day or planning only.
- Database docs: DB, DDL, DML, seed, or API persistence changes only.
- Runtime docs: runtime, API, or service changes only.
- Theme docs: UI, theme, or page changes only.
- Team docs: team-specific PRs only.

## Stop Gates

Stop before changing files when:

- the current branch does not match the requested branch
- the worktree is dirty and the request requires a clean start
- the requested path does not fit `repository/canonical_repository_structure.md`
- the request conflicts with active Project Instructions
- the task would modify runtime code, production pages, database files, wrapper scripts, or repository folders outside the stated scope
- a required source document is missing
- validation fails

## Execution Modes

Official Codex workflow command governance lives in:

`dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`

That file owns Start of Day, PLAN_PR, BUILD_PR, APPLY_PR, and invalid command behavior.

## Referenced Documents

- Project state: `dev/build/ProjectInstructions/PROJECT_STATE.md`
- Repository folder placement SSoT: `dev/build/ProjectInstructions/repository/canonical_repository_structure.md`
- Codex workflow commands: `dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`
- Codex Start-of-Day bootstrap: `dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md`
- Branch lifecycle: `dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`
- PR workflow: `dev/build/ProjectInstructions/addendums/pr_workflow.md`
- Team ownership: `dev/build/ProjectInstructions/team_assignments/team_ownership.md`
- Team assignments: `dev/build/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- Backlog: `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md`
- Database docs: `dev/build/database/`
- Runtime/API standards: `dev/build/ProjectInstructions/standards/`
- Runtime/API governance: `dev/build/ProjectInstructions/addendums/environment_governance_model.md`
- Theme/UI governance: `dev/build/ProjectInstructions/addendums/table_first_ui.md`
- Documentation ownership: `dev/build/ProjectInstructions/addendums/documentation_ownership.md`
- Artifact/reporting standard: `dev/build/ProjectInstructions/addendums/codex_artifact_and_reporting_standard.md`
- Environment governance: `dev/build/ProjectInstructions/addendums/environment_governance_model.md`
- Environment configuration: `dev/build/ProjectInstructions/addendums/environment_configuration_standards.md`
- Active standards: `dev/build/ProjectInstructions/standards/`

## Single Source Of Truth Decisions

- `PROJECT_INSTRUCTIONS.md` owns the manual entry point, required read order, load graph, stop gates, execution modes, and pointers.
- `PROJECT_STATE.md` owns machine-friendly project state metadata.
- `repository/canonical_repository_structure.md` owns all folder placement and file-placement rules.
- `standards/CODEX_WORKFLOW_COMMANDS.md` owns Start of Day, PLAN_PR, BUILD_PR, APPLY_PR, and invalid command behavior.
- `bootstrap/codex_start_of_day_bootstrap.md` owns Start-of-Day bootstrap architecture.
- `addendums/codex_artifact_and_reporting_standard.md` owns the Codex Completion Contract and ZIP outcome rules.
