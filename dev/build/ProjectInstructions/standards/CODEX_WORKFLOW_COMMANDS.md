# Codex Workflow Commands

Status: Approved

Owner: OWNER

## Purpose

Define the official Codex workflow command vocabulary for Start of Day, PR planning, PR implementation, and PR closeout.

This file is the single source of truth for Codex workflow command interpretation. Other Project Instructions documents may point here, but must not duplicate these command rules.

## Start Of Day Commands

Valid Start of Day command format:

```text
Start of Day Owner
Start of Day Alpha
Start of Day Bravo
Start of Day Charlie
Start of Day Gamma
```

Team note:
- `Start of Day Alpha` maps to the current Team Alfa lane where active Project Instructions use the Alfa spelling.
- Historical Team Gamma context may be reported when present, but active assignments follow the current team registry.

Start of Day is read-only.

Start of Day must not require the current branch to be `main`.

Start of Day must not:
- create a branch
- switch branches
- stage files
- commit files
- push branches
- merge PRs
- modify repository files
- partially execute a PR phase

Start of Day reports:
- team
- current branch
- worktree status
- latest main status
- active PR, if any
- recommended next action
- blockers

## Execution Phases

Valid PR execution phase commands:

```text
PLAN_PR
BUILD_PR
APPLY_PR
```

### PLAN_PR

PLAN_PR is planning only.

Rules:
- Do not change files unless the user explicitly requests a planning artifact update.
- Identify the correct branch or start point.
- Identify the intended PR name, purpose, and scope.
- Identify required validation and reporting.
- HARD STOP on unclear scope.
- HARD STOP if Project Instructions conflict with the requested plan.

### BUILD_PR

BUILD_PR is the implementation phase.

Rules:
- Verify branch and worktree rules for the PR before changing files.
- Use the latest Project Instructions.
- Stay inside the approved PR purpose.
- Create required reports.
- Create the required repo-structured ZIP artifact when the active artifact rules require one.
- Run scoped validation required by the PR and Project Instructions.
- HARD STOP on wrong branch.
- HARD STOP on dirty worktree when the PR requires a clean start.
- HARD STOP on scope conflict.
- HARD STOP on missing required Project Instructions.
- HARD STOP on failed required validation unless the task is explicitly a failure-report closeout.

### APPLY_PR

APPLY_PR is the merge and closeout phase.

Rules:
- Verify CI status, validation status, and mergeability before merge.
- Verify the PR merge state is clean.
- Verify required reports and ZIP artifacts exist.
- Merge only when Project Instructions and OWNER direction allow the merge.
- Update local `main` after merge.
- Report final branch, worktree status, local/origin sync status, final commit, and blockers.
- HARD STOP if checks fail.
- HARD STOP if the merge state is not clean.
- HARD STOP if closeout would require unrelated changes.

## Invalid Command Behavior

If a command is invalid, ambiguous, or uses the wrong phase name:

- HARD STOP.
- Return the correct command format.
- Do not guess the intended command.
- Do not partially execute.
- Do not create, change, stage, commit, push, merge, or delete files as part of invalid command recovery.

## Command Ownership

- `PROJECT_INSTRUCTIONS.md` is the only manual Project Instructions entry point.
- This file owns command vocabulary and phase behavior.
- `bootstrap/codex_start_of_day_bootstrap.md` owns Start-of-Day bootstrap architecture.
- `addendums/pr_workflow.md` owns PR lifecycle governance.
- `addendums/project_instructions_single_source_eod_lock.md` owns START / WORK / END branch lifecycle governance.
