# Documentation Ownership

Status: Approved
Owner: OWNER

## Purpose

Define the ownership model for documentation under `dev/build/dev/` after Project Instructions consolidation.

## Canonical Ownership

`dev/build/ProjectInstructions/` owns:
- permanent governance
- team instructions
- standards
- addendums

`dev/build/dev/PR/` owns:
- PR workflow documentation
- reusable PR templates
- historical or reference PR documents

`dev/reports/` owns:
- generated reports
- audits

`dev/workspace/artifacts/` owns:
- generated non-report artifacts
- generated ZIP files
- local temporary workspace output

The repository root `dev/archive/` owns:
- historical reference material only

## Rules

- No active governance may exist outside `dev/build/ProjectInstructions/`.
- No reusable PR template may exist outside `dev/build/dev/PR/templates/`.
- No generated report may exist outside `dev/reports/`.
- No generated non-report artifact may exist outside `dev/workspace/artifacts/`.
- No active document may exist outside its owning area.
- Historical reference material must not be treated as active governance.
- `dev/build/dev/start_of_day/` is a protected legacy handoff area and must not become an active Project Instructions source.

## Folder Rules

- `dev/build/ProjectInstructions/standards/` contains active contract, model, and platform standards.
- `dev/build/dev/PR/templates/` contains reusable PR templates.
- `dev/build/dev/PR/reference/` contains historical or reference PR documents.
- `dev/reports/` contains flat generated report outputs. Use team, runner, lane, or PR naming in filenames instead of nested report folders.
- `dev/workspace/artifacts/zips/` contains repo-structured ZIP outputs.
- `dev/workspace/artifacts/tmp/` contains temporary generated files.

## Validation

Documentation ownership cleanup PRs must verify:

- no active Project Instructions outside `dev/build/ProjectInstructions/`
- no reusable PR templates outside `dev/build/dev/PR/templates/`
- no generated reports outside `dev/reports/`
- no generated non-report artifacts outside `dev/workspace/artifacts/`
- no runtime/product/API/database files changed unless explicitly scoped
