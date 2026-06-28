# Project State

Status: Active

Owner: OWNER

Version: 2026-06-27.PR_26179_OWNER_010

## Purpose

`PROJECT_STATE.md` is the single source of truth for current repository and team state metadata used by Codex Start-of-Day bootstrap summaries.

## Ownership

- `PROJECT_INSTRUCTIONS.md` owns the Project Instructions entry point and referenced load graph.
- `PROJECT_STATE.md` owns current project state metadata.
- `addendums/canonical_repository_structure.md` owns repository folder placement and file-placement rules.

## Current State Fields

Wrappers and Codex bootstrap summaries may report:

- Project State Version
- Repository Version
- Team
- Branch
- Worktree
- Backlog Loaded
- Additional Documents Loaded
- Next Recommended PR

This file documents the state contract only. It does not implement wrapper behavior.
