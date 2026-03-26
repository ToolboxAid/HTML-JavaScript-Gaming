Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V2_9_COMMAND_PALETTE_ACTION_SEARCH.md

# BUILD_PR — Sprite Editor v2.9 (Command Palette + Action Search)

## Objective
Add a canvas-native command palette with searchable actions, built on top of the v2.8 centralized action/keybinding system.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as authority
- No DOM UI
- No architecture rewrite
- Reuse centralized action dispatch from v2.8

## Command Palette Requirements

### Open / Close
- Ctrl + K → open
- Esc → close

### Behavior
- Render as canvas-native overlay panel
- Centered or slightly top-biased
- Does not break layout or hit-testing

### Command Model
Commands must map directly to existing actions:
- tools
- view
- frame
- selection
- system

No duplicate logic.

### Search
- simple text filter
- real-time narrowing
- case-insensitive

### Navigation
- Up / Down arrows
- Enter → execute
- Esc → close

### Visual
- list of commands
- highlight selected row
- optional shortcut hint display

## Palette Integration (IMPORTANT)

User has an existing palette source:
engine/paletteList.js

### Codex directive:
- DO NOT duplicate palette definitions
- Move or reference this file into SpriteEditor scope if needed

Preferred approach:
- import/reuse paletteList.js
- if coupling is too high, copy into:
  tools/SpriteEditor/paletteList.js

But:
- keep it editor-scoped (NOT engine dependency long-term)
- avoid cross-module tight coupling

### Command palette should include:
- palette switching commands
- palette preview names (if available)

## Validation
- Ctrl+K opens palette
- typing filters commands
- Enter executes action
- Esc closes palette
- actions use existing dispatch
- palette list integrates correctly
- no console errors

## Scope
tools/*
docs/*
