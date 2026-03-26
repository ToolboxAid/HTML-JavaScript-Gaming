Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V3_0_FUZZY_COMMAND_RANKING_RECENT_ACTIONS.md

# BUILD_PR — Sprite Editor v3.0 (Fuzzy Command Ranking + Recent Actions)

## Objective
Enhance the command palette with fuzzy search, intelligent ranking, and recent action tracking while preserving existing architecture.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as authority
- No DOM UI
- No architecture rewrite
- Reuse centralized action dispatch

## Requirements

### 1) Fuzzy Search
Replace simple filter with fuzzy matching:
- partial matches
- out-of-order matches
- tolerance for gaps

### 2) Ranking
Sort results by:
1. exact prefix match
2. strong substring match
3. fuzzy score

### 3) Command Metadata
Centralize command definitions:
- id
- label
- category
- shortcut
- keywords
- action

### 4) Recent Actions
- track executed commands
- persist locally
- show when query is empty
- bias ranking toward recent

### 5) Category Display
Show lightweight categories in UI:
- Tool
- View
- Frame
- Selection
- Palette
- System

### 6) Integration
- must reuse existing dispatch
- no duplicate logic
- no layout breakage

## Validation
- fuzzy search works
- ranking feels correct
- recent actions persist
- Enter executes command
- no UI overlap
- no console errors

## Scope
tools/*
docs/*
