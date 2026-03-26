Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V2_8_KEYBOARD_POWER_USER_WORKFLOW.md

# BUILD_PR — Sprite Editor v2.8 (Keyboard + Power User Workflow)

## Objective
Add a centralized keyboard workflow system to the existing canvas-native Sprite Editor so power users can trigger core editor actions quickly and consistently.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM control additions
- No architecture rewrite
- Preserve existing mouse workflows, overflow behavior, and layout systems

## Required Design

### 1) Centralized keybinding map
Introduce one clear source of truth for keyboard bindings.
Do not scatter raw key handling across many unrelated branches.

Suggested categories:
- tool
- view
- frame
- selection
- system

Codex may choose the exact structure, but it must be centralized and reviewable.

### 2) Required default bindings

#### Tools
- B -> Brush
- E -> Erase
- F -> Fill
- I -> Eyedropper
- S -> Select

#### View
- + / = -> Zoom in
- - -> Zoom out
- 0 -> Reset zoom
- X -> Toggle pixel-perfect

#### Frames
- [ -> Previous frame
- ] -> Next frame
- Ctrl + D -> Duplicate frame
- Delete -> Delete frame when appropriate

#### Selection
- Ctrl + C -> Copy
- Ctrl + X -> Cut
- Ctrl + V -> Paste
- Delete -> Clear selection when a selection exists

#### System
- Shift + F -> Full screen
- Esc -> Close overflow panel / cancel transient interaction

### 3) Conflict handling
Keyboard behavior must be deterministic.
Delete behavior must prefer:
1. clear selection if selection exists
2. otherwise use existing delete behavior for frame/content only if that is already part of the current workflow

Codex should keep this safe and unsurprising.

### 4) Discoverability
Add lightweight shortcut discoverability without cluttering the layout.

Acceptable approaches:
- compact shortcut hints in labels where space allows
- compact status/help text updates
- hints in overflow panel entries if practical

Do not introduce overlap or clipping.

### 5) Overflow compatibility
Keyboard shortcuts must work even if related controls are currently hidden in overflow.
Keyboard logic must not depend on a control being visible.

### 6) Preserve input safety
Do not break:
- pointer workflows
- drag workflows
- overflow interaction
- future text input possibilities

### 7) Centralized dispatch
Key handling should dispatch into existing editor actions rather than re-implementing those actions in parallel.

## Validation
- Tool shortcuts work
- Zoom shortcuts work
- Frame shortcuts work
- Selection shortcuts work
- Esc closes overflow panel
- Shortcuts work regardless of overflow visibility
- No layout breakage from discoverability hints
- No console errors

## Scope
tools/*
docs/*
