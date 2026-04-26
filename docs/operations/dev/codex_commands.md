# Codex Commands — BUILD_PR_LEVEL_20_14_WORKSPACE_MANAGER_SHOW_TOOLS_ON_GAME_LAUNCH

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md if present.
Read docs/dev/reports/workspace_manager_default_query_fallback_removal_validation.md if present.

Execute BUILD_PR_LEVEL_20_14_WORKSPACE_MANAGER_SHOW_TOOLS_ON_GAME_LAUNCH.

User UAT finding:
- Samples appear to work: Open <tool> opens tool and data appears.
- Games path opens Workspace Manager, but Workspace Manager shows the game, not the tools.

Goal:
Fix only the Workspace Manager initial view for game-launched context.

Required behavior:
- games/index.html -> Open with Workspace Manager -> tools/Workspace Manager/index.html?gameId=<id>&mount=game
- Workspace Manager opens
- explicit gameId context is loaded
- external launch memory is cleared
- initial primary view shows tools/workspace surface for that game context
- it must not immediately show the hosted game surface
- it must not auto-select the first tool
- it must not fallback to game query param
- it must not reuse stale memory

Clarification:
`mount=game` means source/context is game-launched.
It must not force the initial display to the hosted game surface.

Likely target:
- tools/Workspace Manager/main.js

Forbidden:
- changing samples
- changing labels
- restoring gameId || game
- restoring toolIds[0]
- broad Workspace Manager refactor
- second SSoT
- fallback/default behavior
- start_of_day changes

Validation:
Create docs/dev/reports/workspace_manager_game_launch_tools_view_validation.md with:
- changed files
- proof Open with Workspace Manager still routes to Workspace Manager
- proof explicit gameId is still required
- proof gameId || game fallback is not restored
- proof toolIds[0] first-tool selection is not restored
- proof external launch memory clear remains intact
- proof initial game-launched Workspace Manager view shows tools/workspace surface, not game surface
- proof sample Open <tool> behavior remains untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_14_WORKSPACE_MANAGER_SHOW_TOOLS_ON_GAME_LAUNCH.zip
```
