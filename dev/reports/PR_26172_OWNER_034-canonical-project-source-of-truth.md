# PR_26172_OWNER_034-canonical-project-source-of-truth

## Purpose

Make repository documentation the canonical source of truth for project rules so Codex and ChatGPT do not rely on stale conversation history.

## Summary

- Added a Canonical Source Rule near the top of `PROJECT_INSTRUCTIONS.md`.
- Documented that active repository documentation overrides prior chat history, generated reports, archive material, local notes, and stale external instructions.
- Added canonical active teams: Owner, Alfa, Bravo, Charlie, and Golf.
- Added official NATO spelling guidance.
- Documented that Alpha, Beta, and Gamma must not be used for active teams.
- Preserved historical PR/branch/reference names when clearly historical.

## Scope Boundary

- Documentation/governance only.
- Runtime code was not modified.
- Bootstrap files were not modified.
- No `PROJECT_MULTI_PC.txt` file was created or restored.

## Validation

- `git diff --check`: PASS
- `npm run validate:canonical-structure`: PASS
- Deprecated active-team-name scan in `dev/build/ProjectInstructions/`: PASS with only intentional prohibition/historical non-team phrase matches.
