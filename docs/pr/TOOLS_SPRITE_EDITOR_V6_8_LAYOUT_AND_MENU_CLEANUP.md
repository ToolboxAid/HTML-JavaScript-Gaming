# TOOLS_SPRITE_EDITOR_V6_8_LAYOUT_AND_MENU_CLEANUP

## Purpose
Clean up confusing layer row presentation, add shortcut hints to submenu items, simplify mode naming, and reorganize sidebar/layout sections.

## User-Observed Issue
The current layer row text:
<[V][][] Layer 1 100% active
is too compressed and unclear.

That row currently reads like a packed control strip:
- `[V]` = visible
- the additional `[] []` read as unlabeled toggles/actions
- `Layer 1`
- `100%`
- `active`

Even if technically correct, it is not self-explanatory enough and should be made clearer through layout and labeling.

## Requested Changes
1. Include shortcut text on all submenu items
2. Move `Pixel` to the right side between `Reset` and `Mode`
3. Move `Palette` into the area where the Layers sidebar currently is
4. Move the Layers sidebar/items to where Palette currently is
5. Keep the bottom area for preview controls only:
   - timeline
   - animation preview
   - sheet preview
6. Move descriptive text under Active Tool, or create a new section under Active Tool for it
7. Remove `Std` and use `Pro`
8. Remove `Help` and `About` submenu items from the Help menu

## Scope
Surgical UI/layout cleanup only.
Do not redesign drawing logic.
Do not change core sprite data behavior.
Do not change timeline/frame authority.
Do not reintroduce duplicate control surfaces.

## Required Changes

### 1. Add shortcut labels to submenu items
- Every submenu item should display its shortcut, when one exists.
- Apply this consistently across Files / Edit / Tools / Frame / Layer / Help submenus.
- Shortcut display should be visually secondary but clearly readable.
- Keep the existing action paths intact.

Examples:
- Save .... Ctrl+S
- Command Palette .... Ctrl+P
- Close Surface .... Ctrl+W

### 2. Move Pixel control
- Reposition `Pixel` to the right-side control cluster between `Reset` and `Mode`.
- Keep behavior intact; move only the chrome/layout position.

### 3. Swap Palette and Layers areas
- Move the `Palette` section into the area currently occupied by the Layers sidebar.
- Move the Layers sidebar/items into the area currently occupied by Palette.
- Preserve working behavior for both sections.
- After the move, ensure hit-testing, section titles, spacing, and active state visuals still align correctly.

### 4. Reserve bottom region for previews only
Bottom region should be preview-only:
- timeline
- animation preview
- sheet preview

Do not leave palette/layer sidebar controls mixed into that lower preview zone.

### 5. Move descriptive text
- Move descriptive/helper text under `Active Tool`
OR
- create a new section directly under `Active Tool` for these details

Goal:
- keep top/left controls readable
- remove floating or confusing inline text placement

### 6. Simplify Mode naming
- Remove `Std`
- Use `Pro`
- If a mode label still exists, it should not present `Std`
- Keep implementation minimal:
  - either single `Pro` label/state
  - or a simplified mode display that no longer exposes `Std`

### 7. Remove Help/About submenu entries from Help menu
- Keep the top-level `Help` menu
- Remove submenu entries:
  - Help
  - About
- Keep topic help entries only for the actual functional menus/topics that remain useful:
  - Files
  - Edit
  - Tools
  - Frame
  - Layer
- Keep the top-level `About` popup working as-is

### 8. Make layer rows clearer
- Replace overly compressed unlabeled layer-row controls where practical
- Preserve functionality, but improve readability:
  - visible indicator
  - layer name
  - opacity
  - active state
- If auxiliary layer toggles remain, ensure they are visually understandable and not presented as anonymous empty brackets

## Acceptance
- Submenu items show shortcut hints consistently
- Pixel appears on the right between Reset and Mode
- Palette occupies the former Layers sidebar area
- Layers occupy the former Palette area
- Bottom area is previews only
- Descriptive text is under Active Tool or in a dedicated section below it
- Std is removed and Pro is used instead
- Help menu no longer contains Help or About submenu entries
- About top-level popup still works
- Layer row presentation is clearer than the current compressed bracket form
- No console errors

## Notes
Keep implementation compact and layout-focused.
This is a chrome/usability cleanup pass, not a rendering-engine change.
