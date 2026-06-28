# Project Instructions

## Purpose

`PROJECT_INSTRUCTIONS.md` is the only manual entry point for active Project Instructions.

Codex and future wrappers must request this file directly. All other Project Instructions documents are loaded indirectly through the references below.

## Current Version/Date

- Project Instructions Version: 2026-06-27.PR_26179_OWNER_010
- Date: 2026-06-27
- Owner: OWNER

## Required Read Order

1. Always read `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md`.
2. Always read `dev/build/ProjectInstructions/PROJECT_STATE.md`.
3. Always read `dev/build/ProjectInstructions/repository/canonical_repository_structure.md`.
4. For Start of Day, read `dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md`.
5. Load team, backlog, database, runtime, theme, or other specialist documents only when the current task requires them.

## Load Graph

```text
PROJECT_INSTRUCTIONS.md
|-- PROJECT_STATE.md
|-- repository/canonical_repository_structure.md
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

- Owner: decisions, governance direction, standards.
- Build PR: execute one scoped PR purpose, validate, report, package.
- Continue: continue the current scoped branch or PR without expanding scope.
- Review: findings, risks, recommendations only unless implementation is explicitly requested.
- Challenge: identify contradictions, risks, or better alternatives.
- Stop Gate: stop and report the reason and required correction.

For detailed execution-mode wording, load `dev/build/ProjectInstructions/addendums/assistant_execution_modes.md` only when mode interpretation is unclear.

## Referenced Documents

- Project state: `dev/build/ProjectInstructions/PROJECT_STATE.md`
- Repository folder placement SSoT: `dev/build/ProjectInstructions/repository/canonical_repository_structure.md`
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
- `bootstrap/codex_start_of_day_bootstrap.md` owns Start-of-Day bootstrap architecture.
