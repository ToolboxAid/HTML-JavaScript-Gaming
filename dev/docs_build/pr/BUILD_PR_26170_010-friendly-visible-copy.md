# BUILD PR_26170_010-friendly-visible-copy

## Purpose
- Apply approved friendly names to user-facing copy and visible labels.

## Scope
- Update visible Toolbox copy, tile names, page headings, owner notes, admin labels, and visible documentation.
- Use PR_26170_009 audit boundaries.
- Do not rename routes, folders, data contract keys, or implementation variables.

## Friendly Names
- Project Workspace / Game Workspace -> Game Hub
- Project Team -> Game Crew
- Project Progress -> Game Progress
- Publishing Progress -> Launch Progress
- Users -> Creators
- Roles -> Responsibilities
- Permissions -> Access
- Invitations -> Invites
- Administration -> Studio Settings

## Validation
- Verify branch is `main`.
- Run targeted Toolbox/static validation.
- Run Playwright only for affected visible Toolbox rendering.
- Do not run full samples.

## Required Artifacts
- `docs_build/dev/reports/PR_26170_010-friendly-visible-copy.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26170_010-friendly-visible-copy_delta.zip`
