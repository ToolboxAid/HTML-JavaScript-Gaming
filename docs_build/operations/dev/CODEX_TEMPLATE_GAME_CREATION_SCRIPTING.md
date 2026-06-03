# Codex Template Game Creation Scripting

Use `scripts/PS/New-Game-from-Template.ps1` to create a new game scaffold from `old_games/_template` with the standardized asset/data and tool-project contract.

## Script
- `scripts/PS/New-Game-from-Template.ps1`

## Example
```powershell
.\scripts\PS\New-Game-from-Template.ps1 -GameId "my-new-game" -DisplayName "My New Game" -Apply
```

## Generated Structure
- `old_games/<game>/` copied from `old_games/_template/`
- `old_games/<game>/assets/<domain>/` and `old_games/<game>/assets/<domain>/data/` for:
  - `sprites`
  - `tilemaps`
  - `parallax`
  - `vectors`
- `old_games/<game>/assets/tools.manifest.json` (manifest scaffold)
- `old_games/<game>/config/<game>.project.json` (tool project scaffold)

## Guardrails
- Script normalizes `-GameId` to slug format for deterministic paths.
- Script fails if the target game folder already exists.
- Script defaults to dry-run output unless `-Apply` is provided.
- `-DryRun` is supported explicitly for preview checks.
- Script writes empty scaffold metadata only; no engine or gameplay files are altered.
