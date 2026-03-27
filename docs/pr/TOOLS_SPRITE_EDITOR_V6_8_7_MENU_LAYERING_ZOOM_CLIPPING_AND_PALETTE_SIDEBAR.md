# TOOLS_SPRITE_EDITOR_V6_8_7_MENU_LAYERING_ZOOM_CLIPPING_AND_PALETTE_SIDEBAR

## Purpose
Fix three UI issues:
1. All menus/submenus/popups must render on the top layer.
2. Zoomed grid/data must not draw outside their viewport boundary.
3. Palette color selection should be smaller and continue down the sidebar instead of using the "more colors in top Palette menu" hint.

## Problems
- Some menu/submenu surfaces are not reliably presenting as the top-most UI layer.
- When zooming, grid/data can be seen outside the intended canvas/editor boundary.
- Palette selection is currently too limited in the sidebar and relies on a hint instead of using available vertical space.

## Scope
Surgical rendering/layout fix only.
Do not redesign editor behavior.
Do not restore the removed sidebar Palette button.
Do not remove the top-level Palette menu or palette popup path.

## Required Changes

### 1. Force all menus/submenus/popups to top layer
All transient UI surfaces must render above normal editor content:
- top menus
- submenus
- command palette
- About popup
- Help detail popup
- Palette preset popup
- confirm/rename overlays

Requirements:
- draw them after all normal editor chrome/content
- ensure hit-testing prioritizes them before underlying surfaces
- no menu/submenu/popup should appear behind sidebars, previews, canvas, or other panels
- only one transient surface chain should be active at a time

### 2. Clip zoomed grid/data to its viewport boundary
When zooming/panning:
- grid lines must not render outside the canvas/editor viewport they belong to
- sprite/image data must not render outside that boundary either
- any preview/selection overlay tied to the zoomed work area must also respect clipping where appropriate

Implementation intent:
- apply explicit clipping/masking to the draw region
- keep all zoomed content visually contained to its panel bounds
- no bleed into adjacent UI panels or chrome

### 3. Make palette color selection smaller and continue down the sidebar
Replace the current limited palette panel approach with a denser but readable sidebar presentation:
- make individual palette color cells/swatches smaller
- continue the swatch list/grid farther down the sidebar using available vertical space
- remove the "more colors in top Palette menu" hint text
- keep current color/readout and preset label readable
- do not allow the palette section to overflow off-screen

### 4. Keep top-level Palette workflow
- keep the top-level `Palette` menu
- keep `Palette -> Palettes...` popup/list path for full preset switching
- sidebar palette area should remain for direct color selection/display, not workflow duplication

## Acceptance
- All menus/submenus/popups are visually top-most
- Menu hit-testing prefers the top-most transient surface
- Zoomed grid does not render outside its boundary
- Zoomed sprite/data does not render outside its boundary
- Palette swatches are smaller and extend farther down the sidebar
- "more colors in top Palette menu" hint is removed
- Sidebar palette area remains clean and usable
- Top-level Palette menu still works
- No console errors

## Notes
This is a rendering/layering/layout cleanup pass.
Favor clear visual containment and obvious top-layer transient UI behavior.
