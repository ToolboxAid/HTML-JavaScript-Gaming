# Codex Commands — BUILD_PR_LEVEL_20_25_FIX_WORKSPACE_HOST_SIZE_AND_TOOL_RESOLUTION

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.

Execute BUILD_PR_LEVEL_20_25_FIX_WORKSPACE_HOST_SIZE_AND_TOOL_RESOLUTION.

Current UAT failure:
- Page renders in the upper-left corner too small to use.
- It should fill the browser page area top/bottom/left/right.
- This is not browser fullscreen mode; it is full available page layout.
- Pager shows: [PREV]No tool available[NEXT]
- Example URL:
  tools/Workspace Manager/index.html?gameId=Bouncing-ball&mount=game&tool=palette-browser

Goal:
Fix Workspace Manager host/mount layout size and resolve selected tool query.

Required layout:
- html/body/tool-host-page/tool-host-workspace/tool-host-workspace__mount must support full available browser size.
- No tiny fixed upper-left viewport.
- No clipped mini scrollbox.
- Mounted Workspace Manager content should fill available width/height.

Required tool behavior:
- read explicit tool query.
- resolve tool=palette-browser through existing registry/SSoT.
- pager displays resolved display name, e.g. Palette Browser / Manager.
- selected tool mounts/activates.
- if no explicit tool query exists, select/mount first available tool.
- if explicit tool is invalid, show visible diagnostic inside page/mount container.

Forbidden:
- changing samples
- changing labels
- restoring gameId || game
- legacy game query fallback
- second SSoT
- new header/banner
- broad Workspace Manager refactor
- start_of_day changes

Likely files:
- tools/Workspace Manager/main.js
- tools/Workspace Manager/toolHost.css
- any existing Workspace Manager mounted-content CSS only if directly responsible for tiny viewport

Validation:
Create docs/dev/reports/workspace_host_size_and_tool_resolution_validation.md with:
- changed files
- proof host page fills browser viewport
- proof mount container fills available browser area
- proof no tiny upper-left constrained viewport remains
- proof tool=palette-browser resolves to display name
- proof pager no longer shows No tool available for valid game/tool
- proof selected tool mounts/activates
- proof missing tool selects first available tool
- proof invalid tool renders visible diagnostic
- proof gameId || game fallback not restored
- proof samples remain untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_25_FIX_WORKSPACE_HOST_SIZE_AND_TOOL_RESOLUTION.zip
```
