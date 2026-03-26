Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V5_0_PALETTE_EDITOR_COLOR_REPLACE_WORKFLOW.md

# BUILD_PR — Sprite Editor v5.0 (Palette Editor + Color Replace Workflow)

## Objective
Add a production-ready palette workflow so users can inspect, edit, and replace colors safely across the sprite editor, while preserving the current canvas-native architecture and undo/redo safety.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing palette source integration, history engine, dirty-state system, frame/layer model, command palette, and multi-frame range systems
- Keep the first pass disciplined and retro-workflow focused

## Requirements

### 1) Palette editor surface
Add a lightweight canvas-native palette editor/viewer.

Minimum capabilities:
- show current palette colors clearly
- indicate currently selected color
- indicate replacement source/target when in replace workflow
- allow selecting a palette entry as the active drawing color

Optional if clean:
- reorder palette colors
- add/remove colors
- rename palette entries if palette model already supports naming

Codex should keep the MVP focused and not overbuild a full color lab.

### 2) Palette source integration
Continue to use the existing SpriteEditor-local palette source (`tools/SpriteEditor/paletteList.js`).
Do not reintroduce engine coupling.

If multiple named palettes exist:
- allow selecting a palette preset
- surface preset name clearly
- preserve compatibility with the current palette-loading approach

### 3) Color replace workflow
Add a clear replace-color workflow.

Minimum required flow:
- choose source color
- choose target color
- run replace operation

Replace scopes should include at least:
- active layer
- current frame
- selected frame range (if a range is active)

Optional only if clean:
- all frames
- all layers in current frame

Codex should keep the scope model explicit and deterministic.

### 4) Replace behavior
Color replacement must:
- preserve transparency/null pixels correctly
- only replace exact palette/color matches unless Codex has a strong reason otherwise
- behave consistently across layers/frames depending on selected scope

### 5) History integration
Palette replace operations must be undoable as single history entries.
Palette edits that mutate saved state must also be undoable.

No no-op history pollution for replacement operations that do not change anything.

### 6) Dirty-state integration
Palette edits and color replacement operations must participate in dirty-state tracking naturally.

### 7) Save/load compatibility
If palette state is currently part of the saved editor document, palette changes must persist correctly.
If palette presets are editor/view state only, Codex should keep that explicit.

At minimum:
- color replace changes to pixel data must save/load correctly
- palette-related saved fields must remain backward compatible

### 8) Command palette integration
Add first-class commands for at least:
- Palette: Next Color
- Palette: Previous Color
- Palette: Replace Color
- Palette: Set Scope Active Layer
- Palette: Set Scope Current Frame
- Palette: Set Scope Selected Range

Optional if clean:
- Palette: Load Preset
- Palette: Add Color
- Palette: Remove Color

Commands must be:
- searchable
- rankable
- alias-aware
- favorite-able
- macro-compatible

### 9) UI discipline
Do not destabilize:
- tool workflow
- layer panel
- timeline/playback area
- command palette
- overflow/popover system

Palette editing/replacement should fit into the existing context-aware / progressive-disclosure model if helpful.

### 10) Safety behavior
Invalid or no-op replacement actions must fail safely.

Examples:
- source and target are the same
- no source/target selected
- scope contains no matching pixels

Provide lightweight status feedback and avoid no-op history entries.

### 11) Locked layer behavior
Replacement actions must respect locked-layer safety.

Preferred simple rule:
- replacing in a scope skips locked layers or blocks scope if active target layer is locked
- Codex should choose one consistent rule and keep it explicit

Consistency matters more than the exact choice.

### 12) Retro/palette workflow friendliness
Because this is a sprite editor, the palette workflow should feel oriented toward indexed/retro use:
- simple exact replacements
- fast preset switching
- easy active-color selection

Do not turn v5.0 into a full HSV/gradient color editor.

## Validation
- palette colors display clearly
- active color selection works
- palette preset switching works if implemented
- replace color works on active layer
- replace color works on current frame
- replace color works on selected frame range
- replace operations are undoable
- no-op replacements fail safely
- locked-layer rule behaves consistently
- save/load remains valid
- command palette palette actions work
- no console errors

## Scope
tools/*
docs/*
