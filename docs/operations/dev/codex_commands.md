# Codex Commands — BUILD_PR_LEVEL_20_18_AUTO_MOUNT_TOOL_SELECTION_WORKSPACE_SURFACE

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/reports/workspace_manager_hide_tool_banner_validation.md if present.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md if present.

Execute BUILD_PR_LEVEL_20_18_AUTO_MOUNT_TOOL_SELECTION_WORKSPACE_SURFACE.

User UAT finding:
- Current flow forces the user to choose dropdown workspace action, click Select Tool, select the tool, then Mount.
- User wants one dropdown above Editors.
- Tools/cards below should be hidden/locked with an overlay until a tool is selected.
- When a tool is selected, automatically do the next step: activate/mount that selected tool.
- No separate Select Tool + Mount flow should be required for initial game-launched use.

Goal:
Simplify Workspace Manager game-launched tool selection UX while preserving no-default/no-fallback rules.

Required behavior:
- URL tools/Workspace Manager/index.html?gameId=Bouncing-ball&mount=game renders visible Workspace Manager shell/status page.
- Show one explicit tool dropdown above Editors.
- Do not show detached top banner/tool controls.
- Editors/tool cards below are locked/overlaid until tool selection.
- Do not auto-select or mount a default tool on load.
- When user selects a valid tool from dropdown, automatically activate/mount selected tool.
- Remove/hide overlay after activation.
- Do not require Select Tool button or Mount button for initial flow.
- Keep game context loaded.
- Keep external memory clear.
- Keep visible diagnostics for invalid/missing context.

Forbidden:
- changing samples
- changing labels
- restoring gameId || game
- restoring toolIds[0]
- auto-selecting first tool
- mounting a tool on initial game launch before user selection
- broad Workspace Manager refactor
- second SSoT
- fallback/default behavior
- start_of_day changes

Likely files:
- tools/Workspace Manager/main.js
- tools/Workspace Manager/index.html
- Workspace Manager CSS only if needed

Validation:
Create docs/dev/reports/workspace_manager_auto_mount_tool_selection_validation.md with:
- changed files
- proof initial page shows one dropdown above Editors
- proof detached top banner/tool controls are gone
- proof Editors/tools are overlaid/disabled before tool selection
- proof no default tool selected on load
- proof selecting a tool from dropdown auto-mounts/activates it
- proof separate Select Tool and Mount actions are not required for initial flow
- proof toolIds[0] not restored
- proof gameId || game not restored
- proof valid gameId still loads game context
- proof invalid/missing context renders visible diagnostic
- proof samples Open <tool> remain untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_18_AUTO_MOUNT_TOOL_SELECTION_WORKSPACE_SURFACE.zip
```
