Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V3_2_COMMAND_FAVORITES_PINNING.md

# BUILD_PR — Sprite Editor v3.2 (Command Favorites + Pinning)

## Objective
Add user-controlled command favorites/pinning to the existing command palette so frequently used actions can be intentionally prioritized beyond recent-action behavior.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing command metadata, ranking, and dispatch flow

## Requirements

### 1) Favorite state
Introduce favorite/pinned command state:
- store favorite command IDs
- persist in localStorage
- load on startup

### 2) Ranking behavior
Favorites should influence ranking, especially when:
- query is empty
- query weakly matches multiple commands

But:
- exact strong matches should still rank highest
- favorites should not override obviously better exact results

### 3) UI indication
Show a lightweight favorite indicator on command rows.
Examples:
- star
- pin
- compact marker

Must remain:
- canvas-native
- readable
- uncluttered

### 4) Toggle behavior
Provide a simple way to favorite/unfavorite a command while the palette is open.

Acceptable approaches:
- click on favorite marker in the command row
- lightweight keyboard toggle for selected row
- another compact interaction if it remains obvious and deterministic

Codex should choose the simplest reliable option.

### 5) Metadata reuse
Favorites must layer onto the existing centralized command metadata.
Do not create a second command-definition path.

### 6) Ranking integration
Favorite bias should be incorporated into the existing ranking flow, not bolted on as a disconnected sort pass.

### 7) Persistence safety
If a stored favorite references a command that no longer exists:
- ignore it safely
- do not break palette behavior

## Validation
- favorites persist across reload
- favorites show visually
- favorites influence ranking appropriately
- exact matches still rank highest
- no layout breakage
- no console errors

## Scope
tools/*
docs/*
