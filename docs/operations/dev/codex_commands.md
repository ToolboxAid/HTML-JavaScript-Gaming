# Codex Commands — BUILD_PR_LEVEL_20_19_FORCE_WORKSPACE_TOOL_PAGER_ABOVE_EDITORS

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/reports/workspace_manager_auto_mount_tool_selection_validation.md if present.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md if present.

Execute BUILD_PR_LEVEL_20_19_FORCE_WORKSPACE_TOOL_PAGER_ABOVE_EDITORS.

User UAT correction:
- Do not use a new HEADER at all.
- Delete/remove what was created as the top Workspace Manager header/banner/control area.
- Force this UI centered above Editors:
  [PREV] <toolname> [NEXT]
- On page load, default <toolname> to the first tool in the available list.
- No more attempts to keep the header.
- No dropdown + Select Tool + Mount initial workflow.

Goal:
Replace the current top header/banner/dropdown workflow with a centered tool pager directly above Editors.

Required behavior:
- URL tools/Workspace Manager/index.html?gameId=Bouncing-ball&mount=game renders existing Workspace Manager page shell.
- Remove newly created top banner/header/control content.
- Directly above Editors, centered, render:
  [PREV] <selected tool name> [NEXT]
- On page load, select the first available tool for the explicit gameId context.
- Activate/mount selected tool on page load.
- Prev/Next changes the selected tool and active/mounted tool.
- Do not require dropdown.
- Do not require Select Tool button.
- Do not require Mount button.
- Keep game context loaded from explicit gameId.
- Keep samples untouched.

User-approved exception:
- First available tool selected on page load is REQUIRED for this PR.
- This is not considered fallback/default anti-pattern for this PR.

Still forbidden:
- restoring gameId || game
- legacy game query fallback
- hidden fallback routing
- stale memory reuse
- new header/banner
- broad Workspace Manager refactor
- second SSoT
- start_of_day changes

Likely files:
- tools/Workspace Manager/main.js
- tools/Workspace Manager/index.html
- Workspace Manager CSS only if needed

Validation:
Create docs/dev/reports/workspace_manager_tool_pager_above_editors_validation.md with:
- changed files
- proof newly created header/banner/control area removed
- proof centered [PREV] <toolname> [NEXT] appears above Editors
- proof first available tool selected on page load
- proof selected tool active/mounted on page load
- proof Prev/Next changes selected/mounted tool
- proof dropdown + Select Tool + Mount initial workflow removed
- proof gameId || game fallback not restored
- proof game context still loads from explicit gameId
- proof sample Open <tool> remains untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_19_FORCE_WORKSPACE_TOOL_PAGER_ABOVE_EDITORS.zip
```
