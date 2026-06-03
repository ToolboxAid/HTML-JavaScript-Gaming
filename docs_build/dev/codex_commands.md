# Codex Commands

Task: `PR_26154_010-svg-favicon-normalization`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- Targeted `rg`, `Get-ChildItem`, and `Get-Content` inventory for:
  - `favicon.svg`
  - `favicon.ico`
  - active HTML favicon links
  - manifest files
  - Theme V2 favicon references
  - root-level branding asset candidates
- Node move/rewrite script for:
  - `assets/theme/v2/images/favicon.svg` -> `favicon.svg`
  - removing `favicon.ico`
  - active HTML favicon links -> `/favicon.svg`
- Targeted patch for:
  - `scripts/PS/deploy/WebsiteRepoDeploymentCommon.ps1`
    - `favicon.ico` -> `favicon.svg`
- Targeted reference checks for:
  - `favicon.svg`
  - `favicon.ico`
  - `assets/theme/v2/images/favicon.svg`
  - active HTML icon links
  - manifest references
- Node static/path validation for changed HTML, JS, JSON, and Markdown paths.
- PowerShell parser validation for the changed deployment helper.
- Node HTTP validation for `/favicon.svg`.
- `git status --short -- start_of_day old_games old_samples`
- `git diff --check`
- `npm run codex:review-artifacts`
- Python ZIP packaging for `tmp/PR_26154_010-svg-favicon-normalization_delta.zip`

Validation summary:

- PASS root `/favicon.svg` exists and resolves.
- PASS root `/favicon.ico` no longer exists.
- PASS old Theme V2 favicon source path removed.
- PASS active HTML favicon references use `/favicon.svg`.
- PASS no active references remain to `favicon.ico`.
- PASS no active references remain to `assets/theme/v2/images/favicon.svg`.
- PASS no active manifest icon references were found.
- PASS changed PowerShell deployment helper parses successfully.
- PASS `old_games/`, `old_samples/`, and `start_of_day/` unchanged.
- PASS `git diff --check`.
- PASS `npm run codex:review-artifacts`.
- SKIPPED `npm run test:workspace-v2`; active Workspace V2 launch/navigation behavior was not changed.
- SKIPPED old_games, old_samples, and full samples smoke validation per request.
