# PR_26172_OWNER_018-nato-team-normalization

## Scope

Normalize team names everywhere in `docs_build/dev/ProjectInstructions/`.

## Changes

- Replaced `Alpha` with `Alfa`.
- Replaced `Beta` with `Bravo`.
- Replaced `Gamma` with `Charlie`.
- Preserved `OWNER`.
- Preserved existing ProjectInstructions content and structure.

## Validation

- `git diff --check`
- `git diff --cached --check`
- Text search for `Alpha`, `Beta`, and `Gamma` in `docs_build/dev/ProjectInstructions/`

## Skipped Lanes

- Playwright skipped: documentation-only normalization.
- Samples skipped: documentation-only normalization.

## Package

- `tmp/PR_26172_OWNER_018-nato-team-normalization_delta.zip`
