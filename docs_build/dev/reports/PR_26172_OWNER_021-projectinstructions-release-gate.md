# PR_26172_OWNER_021-projectinstructions-release-gate

## Scope

Create the final ProjectInstructions release gate checklist.

## Changes

- Added `docs_build/dev/ProjectInstructions/RELEASE_GATE.md`.
- Included required checks for the ProjectInstructions folder, anchor files, NATO normalization, Day Work / EOD Merge rule, OWNER lock rule, protected instruction preservation, no direct main commits, and team-start gating.

## Validation

- `git diff --check`
- `git diff --cached --check`
- Text search for `Alpha`, `Beta`, and `Gamma` in `docs_build/dev/ProjectInstructions/`
- Required file existence checks
- Tree output for `docs_build/dev/ProjectInstructions/`

## Skipped Lanes

- Playwright skipped: documentation-only release gate.
- Samples skipped: documentation-only release gate.

## Package

- `tmp/PR_26172_OWNER_021-projectinstructions-release-gate_delta.zip`
