# PR_26172_OWNER_017-project-instructions-bootstrap-install

## Purpose

Install the missing ProjectInstructions operating system into the repository.

This is an installation PR, not a governance-design PR.

## Source

The installed files use governance already approved across OWNER/Master-to-OWNER ProjectInstructions PRs 001-016:

- ProjectInstructions root and README bootstrap
- preservation and archive governance
- backlog governance and Game Journey MVP population
- team assignments and team registry
- release readiness gate
- team start commands
- all-team Codex execution method
- Day Work / EOD Merge rule
- Build Path sync and tile overlay status governance
- deprecation workflow
- OWNER override and OWNER safety rules

## Files Installed

- `docs_build/dev/ProjectInstructions/README.txt`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/TEAM_START_COMMANDS.md`
- `docs_build/dev/ProjectInstructions/addendums/build_path_sync.md`
- `docs_build/dev/ProjectInstructions/addendums/deprecation.md`
- `docs_build/dev/ProjectInstructions/addendums/multi_team.md`
- `docs_build/dev/ProjectInstructions/addendums/preservation.md`
- `docs_build/dev/ProjectInstructions/addendums/team_release_readiness.md`
- `docs_build/dev/ProjectInstructions/addendums/tile_overlay_status.md`
- `docs_build/dev/ProjectInstructions/archive/README.md`
- `docs_build/dev/ProjectInstructions/archive/history/.gitkeep`
- `docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md`
- `docs_build/dev/ProjectInstructions/deprecation/README.md`
- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`

## Validation

- `git diff --check`
- `git diff --cached --check`
- Physical tree verification for `docs_build/dev/ProjectInstructions/`
- Targeted text verification for OWNER override, OWNER safety rules, team registry, EOD merge rule, and required anchor files

## Skipped Lanes

- Playwright skipped: documentation-only installation.
- Samples skipped: documentation-only installation.

## Package

- `tmp/PR_26172_OWNER_017-project-instructions-bootstrap-install_delta.zip`
