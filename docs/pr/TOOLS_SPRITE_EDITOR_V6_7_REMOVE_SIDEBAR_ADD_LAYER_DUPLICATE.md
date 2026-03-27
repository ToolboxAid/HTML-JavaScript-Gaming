# TOOLS_SPRITE_EDITOR_V6_7_REMOVE_SIDEBAR_ADD_LAYER_DUPLICATE

## Purpose
Remove the duplicated `Add Layer` control from the sidebar while keeping the `Add Layer` action in the `Layer` top menu.

## Requested Behavior
- Keep: `Add Layer` under the `Layer` menu
- Remove: sidebar `Add Layer` control/button

## Scope
Surgical cleanup only.
Do not redesign the layer panel.
Do not remove layer visibility, active-layer readout, or other valid layer sidebar controls.
Do not change layer creation behavior beyond removing the duplicate sidebar entry point.

## Required Changes

### 1. Remove sidebar Add Layer control
- Remove the `Add Layer` button/control from the sidebar.
- Remove any sidebar-only layout allocation tied to that button.
- Remove any sidebar-only hit-test logic tied only to that button.

### 2. Keep Layer menu Add Layer
- Preserve `Add Layer` in the top `Layer` menu.
- Preserve its current action path and behavior.

### 3. Avoid duplicate entry points
- After this change, there should be only one visible `Add Layer` entry point in the editor chrome: the `Layer` menu item.
- Do not remove non-duplicate layer controls that serve a different purpose.

### 4. Keep layout stable
- After removing the sidebar button, ensure the sidebar/layer area still lays out cleanly with no dead gap, overlap, or broken alignment.

## Acceptance
- Sidebar `Add Layer` control is removed
- `Layer` menu still contains `Add Layer`
- `Layer -> Add Layer` still works correctly
- No duplicate visible `Add Layer` entry point remains
- Sidebar layout remains clean
- No console errors

## Notes
This is a duplicate-control cleanup pass only.
Keep implementation minimal and localized.
