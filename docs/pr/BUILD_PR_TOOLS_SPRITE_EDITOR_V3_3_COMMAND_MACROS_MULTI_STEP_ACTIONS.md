Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V3_3_COMMAND_MACROS_MULTI_STEP_ACTIONS.md

# BUILD_PR — Sprite Editor v3.3 (Command Macros + Multi-Step Actions)

## Objective
Add macro support so users can execute multiple existing actions in sequence as a single command, without changing the current architecture.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing command metadata, ranking, favorites, aliases, and dispatch system

## Requirements

### 1) Macro model
Introduce a centralized macro definition model.

Suggested shape:
- id
- label
- category
- aliases
- keywords
- actions: [actionId, actionId, ...]

Macros must be treated as first-class command-palette items.

### 2) Execution
Macros must execute by reusing the existing dispatch/action system.
Do not implement duplicate action logic.

Execution behavior:
- run actions sequentially
- stop safely if a missing/invalid action is encountered
- fail gracefully without breaking the editor

### 3) Persistence
Support persisted macro definitions in localStorage.

At minimum:
- load macros at startup
- save macros when changed
- ignore invalid stored macros safely

### 4) Command palette integration
Macros must integrate with the existing command palette system:
- searchable
- fuzzy ranked
- alias-aware
- recent-aware
- favorite-able

### 5) Visual identification
Macros should be visually identifiable in the palette.
Examples:
- [Macro] prefix
- category label
- compact macro marker

Codex may choose the cleanest lightweight option.

### 6) Initial creation path
Keep macro creation lightweight in this PR.

Acceptable options:
- seed with a small built-in macro list
- support a minimal code/config-driven registry
- optionally support localStorage-driven custom macro injection if trivial

Do NOT build a large macro editor UI in this PR.

### 7) Safety
If a macro references an action that no longer exists:
- skip or stop safely
- surface a lightweight error/status message
- do not crash palette behavior or ranking

### 8) Reuse metadata pipeline
Macros must use the same centralized command pipeline as normal commands.
Do not create a disconnected parallel palette.

## Validation
- macros appear in command palette
- macros execute multi-step action sequences
- macros are searchable
- macros can be favorited
- macros work with aliases/ranking
- missing actions fail safely
- no console errors

## Scope
tools/*
docs/*
