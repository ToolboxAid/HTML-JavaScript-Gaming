# Codex Commands — BUILD_PR_LEVEL_20_23_MOVE_TOOL_HOST_PAGER_INSIDE_MOUNT_CONTAINER

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.

Execute BUILD_PR_LEVEL_20_23_MOVE_TOOL_HOST_PAGER_INSIDE_MOUNT_CONTAINER.

User correction:
The tool-host-pager section must be moved out of the top-level Workspace Manager host shell and into:
<div data-tool-host-mount-container class="tool-host-workspace__mount"></div>

Current wrong structure:
<main class="tool-host-workspace">
  <section class="tool-host-pager">...</section>
  <div data-tool-host-mount-container class="tool-host-workspace__mount"></div>
</main>

Required:
<main class="tool-host-workspace">
  <div data-tool-host-mount-container class="tool-host-workspace__mount">
    ...mounted Workspace Manager content...
    <section class="tool-host-pager">...</section>
    ...Editors...
  </div>
</main>

Required changes:
1. Remove top-level section.tool-host-pager from tools/Workspace Manager/index.html.
2. Ensure main.js renders/creates the pager inside [data-tool-host-mount-container].
3. Place pager above Editors/card grid inside mounted Workspace Manager content.
4. Keep pager controls wired:
   - [PREV]
   - current tool name
   - [NEXT]
   - hidden select if needed by existing code
5. On load, select/mount first available tool.
6. Prev/Next changes selected/mounted tool.

Forbidden:
- duplicate pager
- top-level pager before mount container
- appending pager to document.body
- putting pager above site chrome/header
- restoring gameId || game
- changing samples
- broad Workspace Manager refactor
- start_of_day changes

Validation:
Create docs/dev/reports/tool_host_pager_inside_mount_container_validation.md with:
- changed files
- proof Workspace Manager index no longer has top-level section.tool-host-pager
- proof section.tool-host-pager is rendered inside data-tool-host-mount-container
- proof pager appears above Editors/card grid inside mounted content
- proof pager is not above Toolbox Aid site header/chrome
- proof first available tool selected/mounted on load
- proof Prev/Next changes selected/mounted tool
- proof gameId || game fallback not restored
- proof samples remain untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_23_MOVE_TOOL_HOST_PAGER_INSIDE_MOUNT_CONTAINER.zip
```
