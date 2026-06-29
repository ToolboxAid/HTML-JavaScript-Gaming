# Startup Contract

Before performing ANY task, Codex must:

- Read `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS_VERSION.md`.
- Read the latest `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md` from the repository.
- Treat repository Project Instructions as the only authoritative source.
- Discard previously remembered Project Instructions before every Codex task.
- Never allow conversation memory to override repository instructions.
- Load all referenced instruction documents required by this file and the task.
- Validate canonical paths.
- Load and validate `dev/build/ProjectInstructions/PROJECT_BRANCHING_POLICY.md`.
- Validate ZIP and report locations.

Every Codex response must begin with:

```text
Startup Validation
==================

Reading latest (v<version>) Project Instructions... PASS

Instruction Source
------------------
Repository ........ PASS
Cached Memory ..... DISCARDED

Canonical paths
---------------
Reports .......... dev/reports
ZIPs ............. dev/workspace/zips

Branching Policy
----------------
Source ............ PROJECT_BRANCHING_POLICY.md
Version ........... <version>
Status ............ PASS

Legacy path check
-----------------
tmp/ ............. PASS (not used)
docs_build/ ...... PASS (not used)

Project Instructions loaded successfully.
```

If Codex cannot determine the current version or cannot validate canonical paths, it must STOP before performing any work.

Failure response example:

```text
Startup Validation
==================

Unable to determine Project Instructions version.

STOP

Project Instructions were not successfully loaded.
```

This startup validation applies to every Codex task and outcome:

- PLAN
- BUILD
- APPLY
- Review
- Audit
- Governance
- Validation
- Read-only
- Hard stop
- No-op
- Partial completion

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
- Delta
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

- Project Instructions Version: 2026.06.28.016
- Date: 2026-06-28
- Owner: OWNER

## Required Read Order

1. Always read `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS_VERSION.md`.
2. Always read `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md`.
3. Always read `dev/build/ProjectInstructions/PROJECT_BRANCHING_POLICY.md`.
4. Always read `dev/build/ProjectInstructions/PROJECT_STATE.md`.
5. Always read `dev/build/ProjectInstructions/repository/canonical_repository_structure.md`.
6. For Codex workflow command interpretation, read `dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`.
7. For Start of Day, read `dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md`.
8. Load team, backlog, database, runtime, theme, or other specialist documents only when the current task requires them.

## Load Graph

```text
PROJECT_INSTRUCTIONS.md
|-- PROJECT_INSTRUCTIONS_VERSION.md
|-- PROJECT_BRANCHING_POLICY.md
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

- `PROJECT_INSTRUCTIONS_VERSION.md`: always.
- `PROJECT_INSTRUCTIONS.md`: always.
- `PROJECT_BRANCHING_POLICY.md`: always.
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

- Project Instructions version: `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS_VERSION.md`
- Project branching policy: `dev/build/ProjectInstructions/PROJECT_BRANCHING_POLICY.md`
- Project state: `dev/build/ProjectInstructions/PROJECT_STATE.md`
- Repository folder placement SSoT: `dev/build/ProjectInstructions/repository/canonical_repository_structure.md`
- Proposed repository layout architecture plan: `dev/build/ProjectInstructions/repository/repository_layout_architecture_plan.md`
- `www/` migration map: `dev/build/ProjectInstructions/repository/www_migration_map.md`
- Codex workflow commands: `dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`
- Codex Start-of-Day bootstrap: `dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md`
- Branch lifecycle: `dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`
- PR workflow: `dev/build/ProjectInstructions/addendums/pr_workflow.md`
- Team ownership: `dev/build/ProjectInstructions/team_assignments/team_ownership.md`
- Team assignments: `dev/build/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- Backlog: `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md`
- Team backlog/startup assignment standard: `dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md`
- Tool Votes/Admin Owner priority signal source: `admin/tool-votes.html`
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

- `PROJECT_INSTRUCTIONS_VERSION.md` owns the current Project Instructions version and startup version proof.
- `PROJECT_INSTRUCTIONS.md` owns the manual entry point, startup contract, required read order, load graph, stop gates, execution modes, and pointers.
- `PROJECT_BRANCHING_POLICY.md` owns Independent PR, Stacked PR, Owner branching, non-Owner team branching, exception, dependency, review, merge, and hard-stop rules.
- `PROJECT_STATE.md` owns machine-friendly project state metadata.
- `repository/canonical_repository_structure.md` owns all folder placement and file-placement rules.
- `standards/CODEX_WORKFLOW_COMMANDS.md` owns Start of Day, PLAN_PR, BUILD_PR, APPLY_PR, and invalid command behavior.
- `bootstrap/codex_start_of_day_bootstrap.md` owns Start-of-Day bootstrap architecture.
- `addendums/codex_artifact_and_reporting_standard.md` owns the Codex Completion Contract and ZIP outcome rules.
