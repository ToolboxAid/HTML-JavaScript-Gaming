# Codex Commands — BUILD_PR_LEVEL_20_15_REPAIR_WORKSPACE_MANAGER_BLANK_GAME_LAUNCH

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/reports/workspace_manager_game_launch_tools_view_validation.md if present.
Read docs/dev/reports/workspace_manager_default_query_fallback_removal_validation.md if present.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md if present.

Execute BUILD_PR_LEVEL_20_15_REPAIR_WORKSPACE_MANAGER_BLANK_GAME_LAUNCH.

User UAT failure:
- URL renders blank page with no visible error:
  tools/Workspace Manager/index.html?gameId=Breakout&mount=game
- Blank occurs for multiple Open with Workspace Manager launches.

Goal:
Repair Workspace Manager so valid game-launched URLs render visible Workspace Manager content and invalid context renders visible diagnostics.

Required behavior:
- URL tools/Workspace Manager/index.html?gameId=Breakout&mount=game renders visible Workspace Manager page
- explicit gameId context is loaded
- external launch memory is cleared
- tools/workspace surface is visible for selected game context
- blank page is forbidden
- if boot/context/view fails, render visible diagnostic panel on page
- do not restore gameId || game
- do not restore toolIds[0]
- do not auto-select first tool
- do not fallback to default route/view/tool/workspace
- do not reuse stale memory

Likely files:
- tools/Workspace Manager/index.html
- tools/Workspace Manager/main.js
- directly imported Workspace Manager boot/view helper files only if needed

Forbidden:
- changing samples
- changing labels
- broad Workspace Manager refactor
- second SSoT
- fallback/default behavior
- start_of_day changes

Validation:
Create docs/dev/reports/workspace_manager_blank_game_launch_repair_validation.md with:
- changed files
- root cause of blank page
- proof Breakout URL renders visible content
- proof multiple gameIds do not blank
- proof invalid/missing gameId renders visible diagnostic
- proof gameId || game fallback is not restored
- proof toolIds[0] first-tool selection is not restored
- proof no fallback/default route/view was added
- proof external memory clear remains intact
- proof sample Open <tool> behavior remains untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_15_REPAIR_WORKSPACE_MANAGER_BLANK_GAME_LAUNCH.zip
```
