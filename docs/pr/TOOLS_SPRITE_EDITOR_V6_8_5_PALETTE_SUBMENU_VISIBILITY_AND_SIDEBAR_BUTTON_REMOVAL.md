# TOOLS_SPRITE_EDITOR_V6_8_5_PALETTE_SUBMENU_VISIBILITY_AND_SIDEBAR_BUTTON_REMOVAL

## Purpose
Fix the Palette -> Palettes submenu so the palette entries are actually visible/selectable, and remove the duplicate Palette button from the sidebar.

## Problems Confirmed
1. Clicking `Palette -> Palettes` does not show visible selectable palette entries.
2. The sidebar `Palette` button is still a duplicate entry point and should be removed.

## Scope
Surgical menu/rendering cleanup only.
Do not redesign palette behavior.
Do not reintroduce panel overflow.
Do not move palette utilities out of the top Palette menu.

## Required Changes

### 1. Make `Palette -> Palettes` visibly open
- Ensure the `Palettes` submenu opens as a real visible submenu surface.
- Palette preset rows must be visibly rendered and selectable.
- The submenu must not open off-screen, behind another surface, or at zero/near-zero height.
- If needed, clamp submenu bounds to the visible editor area.

### 2. Ensure palettes.js presets populate the submenu
- The `Palettes` submenu must contain the actual palette preset entries sourced from palettes.js.
- Each row must be individually visible and clickable.
- The current preset should be visibly indicated if that behavior already exists or can be added cheaply.

### 3. Make palette selection work from the submenu
- Clicking a palette preset in `Palette -> Palettes` must apply that preset correctly.
- After selection, the visible palette panel/current preset readout must update correctly.

### 4. Remove the sidebar Palette button
- Remove the duplicate `Palette` button from the sidebar entirely.
- Remove any sidebar-only layout allocation and hit-test path tied only to that button.
- Top-level `Palette` remains the only palette workflow entry point.

### 5. Keep menu behavior consistent
- `Palette` top menu still opens normally.
- `Palettes` submenu opens from within it.
- Click-outside closes menus.
- `Ctrl+W` closes the active menu surface.
- Only one transient surface chain should be active at a time.

## Acceptance
- `Palette` top menu still exists
- `Palette -> Palettes` opens visibly
- palettes.js presets are visible inside the submenu
- palette preset rows are selectable
- selecting a preset applies it correctly
- sidebar `Palette` button is removed
- no duplicate palette entry point remains outside the top menu
- no console errors

## Notes
This is a corrective follow-up to v6.8.4.
The priority is visible/selectable submenu behavior and removal of the duplicate sidebar button.
