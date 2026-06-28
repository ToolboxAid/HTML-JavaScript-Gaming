# Codex Start-of-Day Bootstrap

Status: Approved

Owner: OWNER

## Purpose

Define the Codex Start-of-Day bootstrap architecture for loading the latest Project Instructions, project state, team context, and branch/worktree status before implementation begins.

This document is documentation and wrapper/bootstrap design only. It does not implement wrapper behavior.

## Bootstrap Phrase

A Bootstrap Phrase is a short user-facing phrase that asks the wrapper to resolve the latest Project Instructions and team state before launching Codex.

Official Start of Day command format and invalid command behavior live in:

`dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`

This bootstrap document owns the loading architecture only. It must not duplicate the command vocabulary.

## Bootstrap Responsibilities

The bootstrap loads:

- Latest Project Instructions SSoT
- `PROJECT_STATE.md`
- Canonical Repository Structure
- Team instructions
- Team backlog
- `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md` assignment source
- `admin/tool-votes.html` Tool Votes/Admin Owner priority signal source
- Current team status
- Current branch
- Worktree status

The bootstrap requires the current branch to be `main`, the worktree to be clean, and local `main` to be synced with `origin/main`.

Allowed bootstrap sync actions:

```text
git fetch origin
git pull --ff-only origin main
```

If the current branch is not `main`, the bootstrap must HARD STOP and return:

```text
git switch main
git pull --ff-only origin main
Start of Day {Team}
```

The bootstrap must not create branches, switch branches, commit files, move files, or run implementation work by itself.

Start-of-Day bootstrap must satisfy the Codex Completion Contract in `dev/build/ProjectInstructions/addendums/codex_artifact_and_reporting_standard.md` with a review-only ZIP unless a hard stop occurs.

## Wrapper Responsibilities

The wrapper performs:

- Branch verification
- Worktree verification
- Bootstrap loading
- Version reporting
- Start-of-day summary
- Launch Codex with the resolved instruction set

The wrapper must not modify runtime code, production pages, or existing wrapper scripts as part of this architecture definition.

## Startup Governance Included Here

This bootstrap document supersedes `dev/build/ProjectInstructions/addendums/codex_project_instructions_startup.md`.

Codex must use Project Instructions as the only active source of truth for:

- Governance rules
- Repository standards
- Ownership rules
- Workflow rules
- Addendums
- Execution modes
- Artifact requirements

Codex must follow the canonical lifecycle in:

```text
dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md
```

This bootstrap architecture only requires Codex to read and apply that canonical lifecycle; it must not define a competing lifecycle rule.

Deprecated Project Instructions material outside `dev/build/ProjectInstructions/` is reference-only and must not override active governance.

## Project Reference File Review

When present in `ProjectInstructions.zip`, the active project instruction directory, or `dev/archive/legacy-docs-build/admin-notes/`, Codex must include these recognized project instruction/reference files in the Project Instructions read set:

- `Installs required.txt`
- `Table layout.txt`

Archived reference files are historical reference only. They must not be treated as active Project Instructions.

## Conflict Handling

If a chat instruction conflicts with Project Instructions:

- Stop.
- Do not continue the PR.
- Produce the required ZIP artifact according to the Codex Completion Contract.
- Document the conflict in the run summary or PR report.
- Ask for OWNER direction.

## Execution Mode Validation

When a request contains:

- Start of Day
- PLAN_PR
- BUILD_PR
- APPLY_PR
- Continue
- Follow Project Instructions
- Next PR

Codex must resolve command behavior through:

`dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`

Execution Mode still means:

- Execute the requested work order.
- Do not redesign the process.
- Do not provide alternatives unless a Stop Gate condition exists.

## Standard Bootstrap Report

```text
Bootstrap
----------
Project Instructions Version:
Project State Version:
Repository Version:
Team:
Branch:
Worktree:
Backlog Loaded:
Additional Documents Loaded:
Next Recommended PR:
```

Start-of-Day bootstrap must also include the Team Assignment section defined by:

```text
dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md
```

Required assignment output:

```text
Team Assignment
===============

Source ............ dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md
Priority Source ... admin/tool-votes.html
Team .............. <team>
Status ............ PASS

Assignments
-----------

| Team | Product Area | Status | Complete | Active PR | Next Milestone | Source |
|------|--------------|--------|----------|-----------|----------------|--------|
| Alfa | Objects Manager | Active | 45% | PR_26179_ALFA_011 | Properties | BACKLOG_MASTER.md |
```

## Loading Rules

Only `PROJECT_INSTRUCTIONS.md` is requested directly.

All other documents are loaded indirectly through references from `PROJECT_INSTRUCTIONS.md`.

`PROJECT_INSTRUCTIONS.md` is the only required entry point for Codex Start-of-Day bootstrap loading.

The bootstrap load graph begins at:

```text
dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md
```

## Single Source Of Truth

`PROJECT_INSTRUCTIONS.md` owns:

- Active Project Instructions entry point
- Project Instructions index
- Referenced load graph
- Canonical governance owner links

`PROJECT_STATE.md` owns:

- Current project state metadata
- Project State Version
- Repository/team summary fields used by bootstrap reporting

`canonical_repository_structure.md` owns:

- Repository folder placement
- Valid top-level folders
- Valid dev workspace folders
- File-placement rules
- Invalid legacy path rules

## Future Direction

Future wrappers should understand:

```text
Use Latest Project Instructions
```

without requiring users to specify file paths.

When this phrase is used, the wrapper should resolve `PROJECT_INSTRUCTIONS.md`, follow its references, load current project state and team context, report versions, verify branch/worktree status, and launch Codex with the resolved instruction set.

## Validation

Bootstrap architecture changes are documentation-governance changes unless explicitly scoped otherwise.

Required validation for this design-only layer:

- Documentation review
- `git diff --check`
