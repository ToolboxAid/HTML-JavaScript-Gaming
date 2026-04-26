# Codex Commands — BUILD_PR_LEVEL_20_17_HIDE_TOOL_BANNER_UNTIL_TOOL_SELECTED

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/reports/workspace_manager_tool_selector_surface_validation.md if present.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md if present.

Execute BUILD_PR_LEVEL_20_17_HIDE_TOOL_BANNER_UNTIL_TOOL_SELECTED.

User UAT finding:
- Detached Tool banner is still visible.
- User wants the banner removed/hidden until a tool is selected.
- Initial Workspace Manager page should show the Workspace Manager shell/status page with:
  - Workspace Manager title
  - First-Class Tools Surface copy
  - Game Source
  - workspace actions
  - Workspace loaded status
  - shared palette/assets status

Goal:
Hide/remove the detached Tool banner until explicit tool selection.

Required initial behavior:
- URL tools/Workspace Manager/index.html?gameId=SolarSystem&mount=game renders visible Workspace Manager shell/status page.
- Do not show Tool / Prev / Next / Mount / Unmount / Open Standalone / Optional JSON state / No tool mounted banner on initial load.
- Do not mount or auto-select a tool on initial load.
- Tool controls may appear only after explicit tool selection or explicit valid tool context.
- Keep game context loaded.
- Keep external memory clear.
- Keep visible diagnostics for invalid/missing context.

Forbidden:
- changing samples
- changing labels
- restoring gameId || game
- restoring toolIds[0]
- auto-selecting first tool
- mounting a tool on initial game launch
- broad Workspace Manager refactor
- second SSoT
- fallback/default behavior
- start_of_day changes

Likely files:
- tools/Workspace Manager/main.js
- tools/Workspace Manager/index.html
- Workspace Manager CSS only if needed

Validation:
Create docs/dev/reports/workspace_manager_hide_tool_banner_validation.md with:
- changed files
- proof initial game-launched page shows Workspace Manager shell/status
- proof detached tool banner is not visible before tool selection
- proof tool controls appear only after explicit tool selection
- proof no first-tool/default selection restored
- proof toolIds[0] not restored
- proof gameId || game not restored
- proof valid gameId still loads game context
- proof invalid/missing context renders visible diagnostic
- proof samples Open <tool> remain untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_17_HIDE_TOOL_BANNER_UNTIL_TOOL_SELECTED.zip
```
