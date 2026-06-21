# PR_26172_OWNER_020-owner-branch-lock-governance

## Scope

Make OWNER follow the same safety lock rules in the installed ProjectInstructions operating system.

## Changes

- Added OWNER branch lock governance to `team_assignments/TEAM_ASSIGNMENTS.md`.
- Added OWNER branch lock governance to `addendums/multi_team.md`.
- Confirmed OWNER branch lock governance in `PROJECT_INSTRUCTIONS.md`.

## Required Rules

- OWNER may override team locks.
- OWNER still has one active assignment at a time.
- OWNER still has one active branch at a time.
- OWNER may not silently delete, rewrite, or remove protected instructions.
- OWNER override must be documented.

## Validation

- `git diff --check`
- `git diff --cached --check`
- Targeted text search for OWNER branch lock rules

## Skipped Lanes

- Playwright skipped: documentation-only governance.
- Samples skipped: documentation-only governance.

## Package

- `tmp/PR_26172_OWNER_020-owner-branch-lock-governance_delta.zip`
