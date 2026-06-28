
# BUILD_PR_LEVEL_20_29_REMOVE_TOOL_SELECT_KEEP_PAGER_ONLY

## Purpose
Remove the tool `<select>` control entirely and keep the pager `[PREV] <toolname> [NEXT]` as the sole navigation.

## Scope
- Remove `<select data-tool-host-select>` from render (DOM + code)
- Remove any logic that populates or listens to the select
- Keep pager working (Prev/Next)
- Keep first-tool-on-load behavior
- Keep mount/remount behavior

## Required Changes
- Delete select element from pager template (or do not render it)
- Remove any references:
  - getElementById('tool-host-select')
  - querySelector('[data-tool-host-select]')
  - select.addEventListener(...)
  - population logic for select
- Ensure no errors if select is absent

## Behavior
- On load:
  - first tool selected and mounted
  - label shows tool name
- Prev/Next:
  - changes tool
  - updates label
  - remounts tool

## Forbidden
- Do not reintroduce select
- Do not break pager
- Do not change layout
- Do not add new UI
