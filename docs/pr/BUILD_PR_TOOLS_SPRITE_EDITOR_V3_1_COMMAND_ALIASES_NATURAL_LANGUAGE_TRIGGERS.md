Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V3_1_COMMAND_ALIASES_NATURAL_LANGUAGE_TRIGGERS.md

# BUILD_PR — Sprite Editor v3.1 (Command Aliases + Natural Language Triggers)

## Objective
Improve the command palette by supporting aliases, shorthand phrases, and lightweight natural-language triggers while preserving the existing architecture and dispatch flow.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing command metadata and centralized dispatch flow from v3.0

## Requirements

### 1) Command aliases
Extend centralized command metadata so each command can define:
- aliases
- shorthand names
- common abbreviations

Examples:
- duplicate frame -> dup frame
- reset zoom -> zoom reset
- pixel perfect -> pixel / toggle pixel
- brush tool -> brush / switch to brush

### 2) Natural-language normalization
Before ranking, normalize user input:
- lowercase
- trim whitespace
- collapse repeated spaces
- remove lightweight punctuation noise
- optionally ignore simple filler words such as:
  - to
  - the
  - tool

This should improve matching without trying to become a full NLP system.

### 3) Ranking integration
Alias and normalized-language matching must feed into the existing ranking system.
Do not bolt on a separate action-resolution path.

### 4) Preserve ranking discipline
Keep ranking predictable:
1. exact label / prefix matches
2. strong alias matches
3. strong substring matches
4. fuzzy matches
5. recent-action bias layered appropriately

### 5) No duplicate action logic
Execution must still flow through:
- centralized command metadata
- existing command dispatch / action paths

### 6) UI behavior
No major UI redesign required.
This is a command understanding upgrade, not a layout rewrite.

Optional:
- if helpful, allow the palette row to show a compact primary alias or shortcut hint
- but do not cause overlap or clipping

## Validation
- aliases resolve correctly
- shorthand phrases resolve correctly
- natural-language phrases improve results
- exact matches still rank highest
- recent actions still work
- no console errors

## Scope
tools/*
docs/*
