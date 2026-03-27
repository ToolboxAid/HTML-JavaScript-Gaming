# TOOLS_SPRITE_EDITOR_V6_6_HELP_MENU_AND_MENU_ORDER

## Purpose
Add a Help menu between Layer and About, give Help submenu entries for each top-level menu, and swap the positions of Tools and Edit.

## Requested Top Menu Order
1. Files
2. Edit
3. Tools
4. Frame
5. Layer
6. Help
7. About

## Scope
Surgical menu/help pass only.
Do not redesign editor behavior.
Do not remove About popup behavior that now validates.
Do not change tool logic or frame/timeline logic.

## Required Changes

### 1. Swap Tools and Edit positions
- Reorder the top-level menu strip so `Edit` appears before `Tools`.
- Preserve existing menu behavior and labels otherwise.

### 2. Add Help between Layer and About
- Insert a new top-level `Help` menu between `Layer` and `About`.
- `Help` should behave like the standard top-level menu/dropdown system, not a popup.

### 3. Help menu contents
Add one Help submenu entry for each main top-level menu:
- Files Help
- Edit Help
- Tools Help
- Frame Help
- Layer Help
- Help
- About

If the current implementation uses singular labels internally, keep the user-facing Help entry names aligned with the visible top menu labels.

### 4. Help item behavior
- Clicking a Help submenu entry should open a detail surface for that topic.
- The detail surface may be a popup/panel/modal, but should be clearly readable and separate from the dropdown list.
- The detail surface must include:
  - title
  - short description of the menu/topic
  - short "How to use" section
  - brief explanation of what each option does
  - visible Close button

### 5. Required Help content shape
For each Help topic:
- Start with a one-line purpose summary.
- Then include a short "How to use" note.
- Then list each visible option in that menu with a short explanation.

Examples:
- Files Help:
  - New: starts a new sprite/project state
  - Save: saves current state
  - Export: exports output
- Tools Help:
  - Brush: paints pixels
  - Erase: removes pixels
  - Fill: fills connected area
  - etc.

Use the actual currently visible menu/tool items from the editor, not placeholders.

### 6. About help entry
- `About` remains a top-level popup item.
- `About` should also have a Help entry inside the Help menu that explains what the About popup is for.

### 7. Shared behavior
- Only one transient surface open at a time.
- Opening a Help detail surface closes the Help dropdown.
- Opening another top-level menu closes any open Help detail surface if the editor uses a single active transient surface model.
- `Ctrl+W` closes Help detail surfaces.
- ESC must remain unhandled by editor UI.

## Acceptance
- Top menu order is Files, Edit, Tools, Frame, Layer, Help, About
- Help exists between Layer and About
- Help menu contains submenu entries for each top-level menu/topic
- Clicking each Help entry opens a readable detail surface
- Each detail surface includes:
  - title
  - short description
  - how to use
  - option descriptions
  - Close button
- Ctrl+W closes Help detail surfaces
- About popup still works
- ESC is not consumed by editor UI
- No console errors

## Notes
Keep implementation compact and centralized.
Prefer generating help content from existing menu definitions where practical, so help stays aligned with visible options.
