# TOOLS_SPRITE_EDITOR_V6_4_MOVE_ALL_TOOLS_TO_TOP_MENU

## Purpose
Move the tool selector and all tool actions into the top menu area so tool access is centralized and no longer split between canvas-side UI and top-level controls.

## Scope
Surgical UI reorganization only.
Do not redesign editor behavior.
Do not reintroduce duplicate tool surfaces.
Keep timeline as the only frame surface.

## Required Changes

### 1. Move tool access to top menu
- Add a top-level `Tools` menu in the top menu bar.
- The `Tools` menu becomes the primary access point for all tools.

### 2. Include all tool entries in the top menu
- Include every editor tool currently exposed through the old tool surface / palette / side controls.
- Use one menu list containing all tool names.
- Clearly indicate the currently active tool.

### 3. Remove old duplicated tool surface(s)
- Remove any persistent in-canvas, side-panel, or duplicated tool list that exists only to choose tools.
- Keep only the top-menu tool access for tool selection.
- Do not remove tool-specific behavior; only remove redundant selection UI.

### 4. Keep active-tool visibility
- The currently selected tool must still be visibly shown somewhere stable in the editor chrome.
- Acceptable options:
  - checkmark in the `Tools` menu
  - active tool label in top status/readout
  - both

### 5. Keep shortcuts and direct-use behavior
- Existing keyboard shortcuts for tools, if any, should keep working unless they conflict with the top menu design.
- Selecting a tool from the new top menu must use the same centralized tool activation path as existing tool changes.

### 6. Menu consistency
- Opening `Tools` should follow the same transient-surface rules as the other top menus.
- Click-outside closes it.
- `Ctrl+W` closes it.
- Only one top menu should be open at a time.

## Acceptance
- A top-level `Tools` menu exists.
- All tool selection entries are available from the top menu.
- Any old duplicated tool-selection surface is removed.
- The active tool is clearly visible.
- Selecting a tool from the top menu works.
- Existing non-conflicting tool shortcuts still work.
- `Tools` menu follows standard menu close behavior.
- No console errors.

## Notes
This is a UI consolidation pass only.
Do not change drawing logic or tool behavior beyond routing selection through the top menu.
