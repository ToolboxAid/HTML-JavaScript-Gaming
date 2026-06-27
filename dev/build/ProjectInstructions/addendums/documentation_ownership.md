# Documentation Ownership

Status: Approved
Owner: OWNER

## Purpose

Define the ownership model for documentation under `dev/` after Project Instructions consolidation.

## Canonical Ownership

`dev/build/ProjectInstructions/` owns:
- permanent governance
- team instructions
- standards
- addendums

`dev/build/pr/` owns:
- PR workflow documentation
- reusable PR templates
- historical or reference PR documents

`dev/reports/` owns:
- generated reports
- audits

`dev/workspace/` owns:
- generated non-report artifacts
- generated ZIP files
- local temporary workspace output

The repository root `dev/archive/` owns:
- historical reference material only

## Rules

- No active governance may exist outside `dev/build/ProjectInstructions/`.
- No reusable PR template may exist outside `dev/build/pr/templates/`.
- No generated report may exist outside `dev/reports/`.
- No generated non-report artifact may exist outside `dev/workspace/`.
- No active document may exist outside its owning area.
- Historical reference material must not be treated as active governance.
- Legacy `start_of_day/` folders are retired and must not become an active Project Instructions source.

## Folder Rules

- `dev/build/ProjectInstructions/standards/` contains active contract, model, and platform standards.
- `dev/build/pr/templates/` contains reusable PR templates.
- `dev/build/pr/reference/` contains historical or reference PR documents.
- `dev/reports/` contains flat generated report outputs. Use team, runner, lane, or PR naming in filenames instead of nested report folders.
- `dev/workspace/zips/` contains repo-structured ZIP outputs.
- `dev/workspace/tmp/` contains temporary generated files.

## Validation

Documentation ownership cleanup PRs must verify:

- no active Project Instructions outside `dev/build/ProjectInstructions/`
- no reusable PR templates outside `dev/build/pr/templates/`
- no generated reports outside `dev/reports/`
- no generated non-report artifacts outside `dev/workspace/`
- no runtime/product/API/database files changed unless explicitly scoped
