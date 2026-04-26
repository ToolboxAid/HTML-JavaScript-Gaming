# Codex Commands — BUILD_PR_LEVEL_20_16_EMBED_TOOL_SELECTOR_IN_WORKSPACE_SURFACE

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/reports/workspace_manager_blank_game_launch_repair_validation.md if present.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md if present.

Execute BUILD_PR_LEVEL_20_16_EMBED_TOOL_SELECTOR_IN_WORKSPACE_SURFACE.

User UAT finding:
- Workspace Manager now renders.
- Tool selector controls appear at the top as a detached banner:
  Tool / Prev / Next / Mount / Unmount / Open Standalone / Optional JSON state / No tool mounted / Switch target / Select a tool to mount.
- This explicit selection behavior is OK.
- But it must be part of the Workspace Manager first-class tools surface, not a top banner.

Goal:
Move/contain the explicit tool selector controls inside the Workspace Manager first-class tools surface.

Required behavior:
- Workspace Manager header/shell remains visible.
- Game Source and workspace status remain visible.
- Tool selector controls render inside the first-class tools surface.
- User still must explicitly select/mount a tool.
- No default/fallback behavior is restored.
- Do not restore gameId || game.
- Do not restore toolIds[0].
- Do not auto-select first tool.
- Do not alter samples.

Likely files:
- tools/Workspace Manager/main.js
- tools/Workspace Manager/index.html
- Workspace Manager CSS only if existing layout requires it

Forbidden:
- changing samples
- changing labels
- broad Workspace Manager refactor
- second SSoT
- fallback/default behavior
- start_of_day changes

Validation:
Create docs/dev/reports/workspace_manager_tool_selector_surface_validation.md with:
- changed files
- proof tool selector no longer renders as top detached banner
- proof tool selector appears inside first-class tools surface
- proof explicit tool selection is still required
- proof no first-tool selection is restored
- proof toolIds[0] is not restored
- proof gameId || game is not restored
- proof game source/status still render
- proof sample Open <tool> remains untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_16_EMBED_TOOL_SELECTOR_IN_WORKSPACE_SURFACE.zip
```
