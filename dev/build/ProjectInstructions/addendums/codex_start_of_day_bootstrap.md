# Codex Start-of-Day Bootstrap

Status: Approved

Owner: OWNER

## Purpose

Define the Codex Start-of-Day bootstrap architecture for loading the latest Project Instructions, project state, team context, and branch/worktree status before implementation begins.

This document is documentation and wrapper/bootstrap design only. It does not implement wrapper behavior.

## Bootstrap Phrase

A Bootstrap Phrase is a short user-facing phrase that asks the wrapper to resolve the latest Project Instructions and team state before launching Codex.

Examples:

- Owner Start of Day
- Team Alpha Start of Day
- Team Bravo Start of Day
- Team Charlie Start of Day
- Team Gamma Start of Day

Team name note:
- `Team Alpha Start of Day` is accepted as a user phrase alias for the canonical Team Alfa lane.
- Historical Team Gamma phrases may be understood for archived/historical context, but active assignment routing follows the current team registry.

## Bootstrap Responsibilities

The bootstrap loads:

- Latest Project Instructions SSoT
- `PROJECT_STATE.md`
- Canonical Repository Structure
- Team instructions
- Team backlog
- Current team status
- Current branch
- Worktree status

The bootstrap must not create branches, commit files, move files, or run implementation work by itself.

## Wrapper Responsibilities

The wrapper performs:

- Branch verification
- Worktree verification
- Bootstrap loading
- Version reporting
- Start-of-day summary
- Launch Codex with the resolved instruction set

The wrapper must not modify runtime code, production pages, or existing wrapper scripts as part of this architecture definition.

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
