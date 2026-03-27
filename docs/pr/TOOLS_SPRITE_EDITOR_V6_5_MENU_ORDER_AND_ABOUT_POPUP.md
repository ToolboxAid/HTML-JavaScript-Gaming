# TOOLS_SPRITE_EDITOR_V6_5_MENU_ORDER_AND_ABOUT_POPUP

## Purpose
Standardize the top menu order and add an About popup with an explicit close button.

## Requested Menu Order
Top menu order should be:
1. Files
2. Tools
3. Edit
4. Frame
5. Layer
6. View
7. Help
8. About

If some menus do not exist yet, preserve existing menus but place `Files`, `Tools`, and `Edit` first, and `About` last.

## Scope
Surgical menu/chrome cleanup only.
Do not redesign editor behavior.
Do not change tool logic.
Do not add a second help/about surface.

## Required Changes

### 1. Normalize top menu order
- Reorder the top menu buttons so they render left-to-right in the required sequence.
- Use the repo/editor’s existing top-menu rendering flow.
- Keep names consistent with existing labels unless the current file uses singular forms that are already established.
- If the current menu label is `File`, rename it to `Files` to match the requested order text.

### 2. Add About as the last top-level menu item
- `About` must be the last top-level item on the menu bar.
- `About` opens a popup/modal/panel surface, not a dropdown list.

### 3. About popup behavior
- The About surface must include:
  - a visible title
  - a visible close button
- Close button must use the shared close-surface path where possible.
- `Ctrl+W` should close the About popup.
- Click-outside may close it only if that matches the shared popup behavior already used elsewhere.
- ESC must NOT be used for closing it.

### 4. About popup contents
At minimum include:
- Sprite Editor
- version or build label if readily available
- brief one-line description

Keep it compact.
Do not over-design.

### 5. Menu consistency
- Only one top-level transient surface open at a time.
- Opening About closes an open dropdown/menu first.
- Opening a dropdown closes About first if the current shared model requires a single active surface.
- No duplicate Help/About surfaces.

## Acceptance
- Top menu order is Files, Tools, Edit, ... , About
- About is the last top-level item
- About opens a popup surface, not a normal dropdown
- About popup includes a visible close button
- Close button closes the About popup correctly
- Ctrl+W closes the About popup
- ESC is not consumed by editor UI
- Other menus still open/close normally
- No console errors

## Notes
This is a menu/chrome polish pass only.
Keep implementation small and aligned with the current shared menu/popup system.
