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

## OWNER Governance

OWNER override wording:

`OWNER override approved: <reason>`

OWNER follows the same safety rules:
- One active OWNER branch at a time.
- One active OWNER assignment at a time.
- OWNER may override team locks, but may not silently delete, rewrite, or remove protected instructions.
- OWNER override must be explicitly documented.

## Four-Team Ownership Alignment

The current active team model uses four delivery teams:

- Team Alfa
- Team Bravo
- Team Charlie
- Team Delta

Team ownership guidance:

- Team Alfa owns Game Hub, Game Journey, Idea Board, creator workflow, creator onboarding, and UX flow.
- Team Bravo owns Audio, Audio Effects, Messages, Emotion Profiles, TTS Profiles, Asset Browser, Vector Art, MIDI Studio, and creator content tools.
- Team Charlie owns repository compliance, validation, infrastructure, storage, environment management, System Health, and operations.
- Team Delta owns engine, runtime, shared JS, API clients, event systems, performance, technical debt remediation, and runtime test coverage.

Rules:
- Teams pull backlog items only from their ownership area unless OWNER explicitly reassigns or splits the work.
- Cross-team work requires OWNER approval and must identify the owning team for each PR.
- Team start commands must remain aligned with this ownership model.
