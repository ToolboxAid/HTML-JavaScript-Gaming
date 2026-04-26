# Codex Commands - BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY

## Model

GPT-5.4

## Reasoning

High

## Command

Run from the repo root after applying this bundle:

```powershell
$rules = Get-Content "docs/dev/codex_rules.md" -Raw
$build = Get-Content "docs/pr/BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY.md" -Raw
codex run "$rules`n`n$build"
```

## Required Codex Behavior

- Read `PROJECT_INSTRUCTIONS.md` before editing.
- Follow `docs/dev/codex_rules.md` exactly.
- Keep the change limited to the Workspace Manager launch UAT path from `games/index.html`.
- Produce `tmp/BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY.zip` after implementation.
