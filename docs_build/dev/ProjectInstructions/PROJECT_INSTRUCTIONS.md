# Project Instructions Operating System

Read `README.txt` first.

This file is the root index for the append-first Project Instructions operating system under `docs_build/dev/ProjectInstructions/`.

## Purpose

The Project Instructions operating system provides additive governance for:

- backlog ownership
- team assignments
- multi-team branch and scope rules
- Build Path status synchronization
- tile overlay status behavior
- deprecation workflow
- archive and history preservation

## Preservation

Existing Project Instructions remain preserved in their current locations. This operating system adds structure without deleting or rewriting existing documentation.

## Folders

- `addendums/` contains additive governance rules.
- `backlog/` contains the central backlog file, `BACKLOG_MASTER.md`.
- `team_assignments/` contains current team assignment records.
- `deprecation/` contains deprecation workflow documentation.
- `archive/` contains retained reference material.
- `archive/history/` contains timestamped history snapshots.

## Merge Control

No PR in this operating system is merged without explicit owner approval.

## Branch Persistence Rule

After a branch is created, the team remains on that active branch.

This applies to:
- Team Alfa through Team Zulu
- Team OWNER

Do not automatically return to main after:
- commit
- push
- draft PR creation
- testing
- bug fixes
- additional commits

Only return to main when:
- the PR is merged
- the branch is retired
- the owner explicitly says: "Return to main"

Purpose:
Allow continued testing, validation, bug fixes, and owner review on the active branch before EOD merge approval.

## Branch Context Rule

The active branch is the working context.

At the beginning of every work session, Codex must report:
- current branch
- expected branch
- active team
- active assignment

If not on the assigned team/OWNER branch:

STOP.

Report:
- expected branch
- current branch
- required action

Do not continue until the branch context is corrected or owner override is provided.

## OWNER Governance

OWNER override wording:

`OWNER override approved: <reason>`

OWNER follows the same safety rules:
- One active OWNER branch at a time.
- One active OWNER assignment at a time.
- OWNER may override team locks, but may not silently delete, rewrite, or remove protected instructions.
- OWNER override must be explicitly documented.
