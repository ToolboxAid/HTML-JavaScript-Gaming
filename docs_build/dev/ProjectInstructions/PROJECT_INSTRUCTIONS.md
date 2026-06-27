# Project Instructions Operating System

Read `README.txt` first.

This file is the root index for the append-first Project Instructions operating system under `docs_build/dev/ProjectInstructions/`.

## Active Source

`docs_build/dev/ProjectInstructions/` is the only active Project Instructions source.

Historical Project Instructions material outside this folder is deprecated reference material only and must not be used as an active source of governance.

## Purpose

The Project Instructions operating system provides additive governance for:

- backlog ownership
- team assignments
- multi-team branch and scope rules
- documentation ownership
- Build Path status synchronization
- tile overlay status behavior
- deprecation workflow
- contract and platform standards
- archive and history preservation
- recognized project instruction/reference files
- environment governance
- tool and gameplay contract governance

## Preservation

Existing Project Instructions outside `docs_build/dev/ProjectInstructions/` remain preserved only as deprecated reference material. When guidance conflicts, active files under `docs_build/dev/ProjectInstructions/` win unless OWNER explicitly approves a newer governance change.

## Folders

- `addendums/` contains additive governance rules.
- `backlog/` contains the central backlog file, `BACKLOG_MASTER.md`.
- `team_assignments/` contains current team assignment records.
- `standards/` contains active contract, model, and platform standards.
- `deprecation/` contains deprecation workflow documentation.
- Retained reference material belongs under the repository root `archive/` tree, not under `docs_build/dev/`.
- History snapshots belong under `archive/docs_build/dev/ProjectInstructions/history/`.

## Recognized Project Reference Files

`docs_build/dev/ProjectInstructions/addendums/project_reference_files.md` defines additional valid project instruction/reference files that must be included in future Project Instructions reviews when present in `ProjectInstructions.zip`, the active project instruction directory, or the root archive reference tree.

## Documentation Ownership

`docs_build/dev/ProjectInstructions/addendums/documentation_ownership.md` defines the active documentation ownership model:

- `docs_build/dev/ProjectInstructions/` owns governance, team instructions, standards, and addendums.
- `docs_build/dev/PR/` owns PR workflow documents, templates, and examples.
- `docs_build/dev/reports/` owns generated reports, audits, and validation artifacts.
- root `archive/` owns historical reference material only.

## Team Backlog, SOD, And EOD Governance

`docs_build/dev/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md` defines required Start of Day team briefings, End of Day team summaries, active team backlog fields, completion percentage update points, backlog-driven next PR selection, and official military team-name spelling.

## Environment Governance

`docs_build/dev/ProjectInstructions/addendums/environment_governance_model.md` defines the official environment model, environment invariance rule, shared API/service contract rule, required Supabase/Postgres/R2 services, required R2 prefixes, and SQLite retired status.

`docs_build/dev/ProjectInstructions/addendums/environment_configuration_standards.md` defines official `.env` file names, environment variable values, host/domain configuration, API URL configuration, R2 prefix configuration, and feature flag governance.

## Tool And Contract Governance

`docs_build/dev/ProjectInstructions/addendums/workspace_v2_playwright_gate.md` defines the Workspace Manager V2 Playwright validation gate.

`docs_build/dev/ProjectInstructions/addendums/samples2tools_adapter_guidance.md` defines the shared sample-to-tool launch and hydration guidance.

`docs_build/dev/ProjectInstructions/addendums/koti_layout_contract.md` defines the King of the Iceberg layout data contract.

`docs_build/dev/ProjectInstructions/addendums/tool_mvp_stacked_pr_standard.md` defines the Creator-facing stacked PR standard for tool MVP work.

`docs_build/dev/ProjectInstructions/addendums/no_mock_repository_runtime_source.md` defines the Browser → API → Database product-data rule and mock repository technical debt boundary.

## Standards

Active contract, model, and platform standards live under:

`docs_build/dev/ProjectInstructions/standards/`

## Single Source and Main Lock Governance

`docs_build/dev/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md` defines the single active Project Instructions source, canonical START / WORK / END branch lifecycle, EOD main lock, next-day reset, team branch creation gate, daily synchronization baseline, and mandatory hard stops.

## Merge Control

No PR in this operating system is merged without explicit owner approval.

## OWNER Governance

OWNER override wording:

`OWNER override approved: <reason>`

OWNER follows the same safety rules:
- One active Team OWNER branch at a time.
- One active OWNER assignment at a time.
- OWNER may override team locks, but may not silently delete, rewrite, or remove protected instructions.
- OWNER override must be explicitly documented.

## Four-Team Ownership Alignment

The single authoritative four-team ownership definition is:

`docs_build/dev/ProjectInstructions/team_assignments/team_ownership.md`

Use the `Current Four-Team Ownership Model` section there for team ownership, assignment routing, and cross-team scope checks.

Rules:
- Teams pull backlog items only from their ownership area unless OWNER explicitly reassigns or splits the work.
- Cross-team work requires OWNER approval and must identify the owning team for each PR.
- Team start commands must remain aligned with this ownership model.

## Current Active Ownership Lanes

OWNER override approved.

The current active ownership lanes are:

- Team Alfa
- Team Bravo
- Team Charlie
- Team Delta
- Team Golf
- Team OWNER

Migration note:
Team Gamma is retired. Team Golf is the replacement active ownership lane.

Rules:
- Do not rewrite historical PR references that mention Team Gamma.
- Do not rename historical branches that contain Gamma.
- Team Golf may own newly assigned work, review packets, cleanup, release, or OWNER-directed cross-team work.
- Team Golf must not silently take backlog ownership from Alfa, Bravo, Charlie, or Delta; cross-team work requires OWNER approval.
