Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V3_4_UNDO_REDO_COMMAND_HISTORY.md

# BUILD_PR — Sprite Editor v3.4 (Undo/Redo Command History Engine)

## Objective
Add an undo/redo command history engine so core editor actions become safely reversible, including support for macro-driven workflows.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse centralized dispatch/action system
- Keep implementation lightweight; avoid full-state deep copies for every action

## Requirements

### 1) History model
Introduce a centralized history engine with:
- undo stack
- redo stack

Each recorded item should represent a reversible command/action.

### 2) Reversible action shape
Codex should introduce a consistent reversible action model, conceptually:
- do/apply
- undo/revert

The exact implementation is flexible, but it must be centralized and reviewable.

### 3) Covered actions
At minimum, undo/redo should work for the main editor actions that mutate state, such as:
- brush/draw
- erase
- fill
- frame add/duplicate/delete/reorder
- selection cut/paste/flip/clear when they mutate pixels
- palette-affecting editor actions if applicable
- other current mutating commands routed through dispatch

### 4) Macro behavior
Macros must integrate safely with history.

Codex may choose one of these models:
- grouped macro history entry (undo whole macro at once)
- step-based history entries (undo each sub-action)

But:
- behavior must be consistent
- behavior must be explicit in code
- recursive macro safety already present must remain intact

### 5) Redo behavior
Redo must:
- reapply undone action(s)
- be cleared when a new mutating action is executed after undo

### 6) Keyboard shortcuts
Add / preserve:
- Ctrl+Z -> Undo
- Ctrl+Y and/or Ctrl+Shift+Z -> Redo

These should route through the same centralized command system.

### 7) Command palette integration
Add first-class commands for:
- Undo
- Redo

These must be:
- searchable
- rankable
- favorite-able
- recent-aware

### 8) Performance
Do not solve this by cloning the entire editor state on every action unless there is no smaller safe option.
Prefer minimal state deltas / snapshots per affected command.

### 9) Failure safety
If an undo/redo entry is invalid or incomplete:
- fail safely
- show lightweight status feedback
- do not corrupt the editor state or crash the palette/input system

## Validation
- Undo works for core mutating actions
- Redo works for core mutating actions
- Undo/redo keyboard shortcuts work
- Undo/redo commands appear in command palette
- Macro behavior is consistent
- Redo stack clears correctly after new action
- No state corruption
- No console errors

## Scope
tools/*
docs/*
