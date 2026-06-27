# PR 11.72 - Workspace Manager Tool Tile JSON Counts

## Purpose
Fix Workspace Manager tool tile `Samples (##)` counts so each tool tile reports the real number of matching sample JSON files.

Known example:
- Palette Browser / Manager currently shows `Samples (12)`.
- Repo contains 20 palette JSON files.
- Tile should show `Samples (20)` when 20 palette JSON files match that tool.

## Scope
- Workspace Manager/tool tile count logic only.
- Count sample JSON files under `samples/**` that match each tool.
- Include palette JSON files in the palette tool count.
- Do not change sample data files unless a count source file requires explicit mapping metadata.
- Do not modify roadmap text except status marker only if execution-backed.

## Required Implementation
Codex must inspect the current Workspace Manager tile-count source and replace any stale/static/partial count source with a derived count based on sample JSON matching.

### Count Rule
For each Workspace Manager tool tile:
1. Determine that tool's JSON match pattern(s).
2. Recursively scan `samples/**` for matching `*.json` files.
3. Set the tile label/count to the matching count.
4. Palette Browser / Manager must count all palette JSON files, including:
   - `*.palette.json`
   - any existing palette JSON naming convention already used by the repo, if present.

### Expected Palette Result
If the repo currently has 20 palette JSON files, the Palette Browser / Manager tile must display:

```text
Samples (20)
```

## Guardrails
- Do not hardcode the number 20.
- Do not hardcode one-off counts for a specific tile.
- Do not create fallback sample data.
- Do not auto-load hidden/default assets.
- Do not broaden into tool registry refactors.
- Do not modify unrelated tools.
- Preserve current tile layout and names.

## Suggested Search Targets
Look for existing count logic in files related to:
- Workspace Manager
- tool tiles
- sample registry/index metadata
- `Samples (` label text
- palette browser / manager tile config

Suggested repo searches:

```powershell
Select-String -Path .\**\*.js,.\**\*.html,.\**\*.json -Pattern "Samples \(" -ErrorAction SilentlyContinue
Select-String -Path .\**\*.js -Pattern "palette" -ErrorAction SilentlyContinue
Select-String -Path .\**\*.js -Pattern "workspace" -ErrorAction SilentlyContinue
```

## Validation
Run targeted validation only.

Required checks:
1. Count palette JSON files:

```powershell
(Get-ChildItem .\samples -Recurse -File -Filter *.json | Where-Object { $_.Name -match 'palette' }).Count
```

2. Open Workspace Manager.
3. Confirm Palette Browser / Manager tile count equals the palette JSON count.
4. Confirm other tool tile counts still render.
5. Run syntax checks only for changed JS files.
6. Do not run full sample smoke test.

## Evidence Report
Create:

```text
docs_build/dev/reports/pr_11_72_workspace_manager_tile_json_counts.md
```

Include:
- files changed
- count source before
- count source after
- palette JSON count from filesystem
- observed Palette Browser / Manager tile count
- targeted tests run
- full suite skipped reason

## Acceptance
- Palette tile count is derived from actual matching palette JSON files.
- Palette Browser / Manager shows `Samples (20)` if 20 palette JSON files exist.
- No hardcoded count constants.
- No hidden/default fallback data introduced.
- Targeted validation documented.
