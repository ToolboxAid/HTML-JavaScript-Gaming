# Documentation Ownership

Status: Approved
Owner: OWNER

## Purpose

Define the ownership model for documentation under `docs_build/dev/` after Project Instructions consolidation.

## Canonical Ownership

`docs_build/dev/ProjectInstructions/` owns:
- permanent governance
- team instructions
- standards
- addendums

`docs_build/dev/PR/` owns:
- PR workflow documentation
- reusable PR templates
- historical or example PR documents

`docs_build/dev/reports/` owns:
- generated reports
- generated validation artifacts
- audits

The repository root `archive/` owns:
- historical reference material only

## Rules

- No active governance may exist outside `docs_build/dev/ProjectInstructions/`.
- No reusable PR template may exist outside `docs_build/dev/PR/templates/`.
- No generated report may exist outside `docs_build/dev/reports/`.
- No active document may exist outside its owning area.
- Historical reference material must not be treated as active governance.
- `docs_build/dev/start_of_day/` is a protected legacy handoff area and must not become an active Project Instructions source.

## Folder Rules

- `docs_build/dev/ProjectInstructions/standards/` contains active contract, model, and platform standards.
- `docs_build/dev/PR/templates/` contains reusable PR templates.
- `docs_build/dev/PR/examples/` contains historical or example PR documents.
- `docs_build/dev/reports/audits/` contains audit report outputs.

## Validation

Documentation ownership cleanup PRs must verify:

- no active Project Instructions outside `docs_build/dev/ProjectInstructions/`
- no reusable PR templates outside `docs_build/dev/PR/templates/`
- no generated reports outside `docs_build/dev/reports/`
- no runtime/product/API/database files changed unless explicitly scoped
