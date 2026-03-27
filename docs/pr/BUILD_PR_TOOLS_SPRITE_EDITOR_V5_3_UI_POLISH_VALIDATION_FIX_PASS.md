Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V5_3_UI_POLISH_VALIDATION_FIX_PASS.md

# BUILD_PR — Sprite Editor v5.3 (UI Polish + Validation Fix Pass)

## Objective
Fix menu interaction bugs and ensure all top-level menus (File, Edit, Frame, Layer) render their items correctly and are fully usable. This is a stabilization pass, not a feature expansion.

## Critical Issue
Menus are opening but showing no items. This indicates:
- menu item definitions are not being passed to the render layer
- OR popover content is not being built correctly
- OR layout clipping / bounds issue is hiding items

This PR must FIX that behavior.

## Requirements

### 1) Menu item rendering (MANDATORY FIX)
Ensure each menu properly renders its items.

Each menu must:
- define items in a centralized structure
- pass items into the popover renderer
- render visible clickable rows

Verify for:
- File
- Edit
- Frame
- Layer

### 2) Debug visibility safeguard
Add a temporary safeguard during build:
- if menu opens with 0 items → show fallback text:
  "No menu items (ERROR)"

This ensures silent failures are impossible.

### 3) Popover sizing / clipping fix
Verify:
- menu height is not zero
- menu is not rendering off-screen
- menu is not clipped by canvas bounds

If needed:
- clamp position inside viewport
- enforce min width / min height

### 4) Hit-testing
Ensure:
- menu items are clickable
- hit regions match rendered rows
- no invisible overlay blocking input

### 5) Data source integrity
Menus must be built from real command/action definitions, not empty placeholders.

Expected:
- File → export/save items present
- Edit → undo/redo/etc
- Frame → frame/range actions
- Layer → layer actions

### 6) Close behavior
Menus must:
- close on outside click
- close on Esc
- switch cleanly between menus

### 7) No architecture rewrite
- keep control surface intact
- reuse existing popover system
- fix wiring, not redesign

## Validation
- All menus show items
- Items are clickable
- No empty menus
- No clipping
- No console errors

## Scope
tools/*
docs/*
