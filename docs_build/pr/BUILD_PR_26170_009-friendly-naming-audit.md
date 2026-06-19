# BUILD PR_26170_009-friendly-naming-audit

## Purpose
- Audit work-like names across Toolbox, owner notes, page labels, visible copy, metadata keys, folder names, routes, variables, and docs.
- Classify each occurrence class before any renaming PRs run.

## Scope
- Documentation/static audit only.
- Recommend friendly names:
  - Project Workspace -> Game Hub
  - Project Team -> Game Crew
  - Project Progress -> Game Progress
  - Publishing Progress -> Launch Progress
  - Users -> Creators
  - Roles -> Responsibilities
  - Permissions -> Access
  - Invitations -> Invites
  - Administration -> Studio Settings
- Do not rename runtime code in this PR.

## Validation
- Verify branch is `main`.
- Run documentation/static validation only.
- Do not run Playwright.
- Do not run full samples.

## Required Artifacts
- `docs_build/dev/reports/PR_26170_009-friendly-naming-audit.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26170_009-friendly-naming-audit_delta.zip`
