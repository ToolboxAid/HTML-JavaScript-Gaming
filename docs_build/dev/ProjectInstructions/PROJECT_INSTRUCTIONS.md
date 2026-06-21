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

## Day Work / EOD Merge Rule

Commit/push during the day is allowed only on assigned team/OWNER/PR branches.

Merge to main is EOD-only and owner-approved, unless the owner explicitly says:
"Merge this PR now."

Do not treat sequential PR completion as merge approval.

## OWNER Governance

OWNER override wording:

`OWNER override approved: <reason>`

OWNER follows the same safety rules:
- One active OWNER branch at a time.
- One active OWNER assignment at a time.
- OWNER may override team locks, but may not silently delete, rewrite, or remove protected instructions.
- OWNER override must be explicitly documented.

### OWNER Branch Lock Governance

- OWNER may override team locks.
- OWNER still has one active assignment at a time.
- OWNER still has one active branch at a time.
- OWNER may not silently delete, rewrite, or remove protected instructions.
- OWNER override must be documented.
