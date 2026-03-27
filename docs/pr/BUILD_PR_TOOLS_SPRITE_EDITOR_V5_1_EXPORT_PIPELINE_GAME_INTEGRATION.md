Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V5_1_EXPORT_PIPELINE_GAME_INTEGRATION.md

# BUILD_PR — Sprite Editor v5.1 (Export Pipeline + Game Integration)

## Objective
Add a practical export pipeline so Sprite Editor assets can move cleanly into the game repo and runtime, while preserving the current canvas-native architecture and keeping export behavior explicit, safe, and deterministic.

## Important context
The editor UI is already dense. This PR must NOT make validation harder by introducing more always-visible controls.
Prefer:
- command palette actions
- existing File menu integration
- compact canvas-native popovers
- no new permanent button clutter

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing export/save systems, timeline/playback data, layer model, palette model, and command system
- Keep output deterministic and engine-friendly

## Requirements

### 1) Export targets
Add a small, explicit export set oriented toward the repo/game workflow.

Minimum exports:
- Sprite Sheet PNG
- Animation JSON
- Combined Export Package metadata JSON

Optional only if clean:
- frame-strip PNG
- layered export metadata for editor-only roundtrip

Keep the export set tight and practical.

### 2) Game-integration metadata
Animation/export metadata should be useful to the game repo.

At minimum include:
- frame dimensions
- frame count
- frame order
- per-frame names or indices
- playback FPS
- loop info if relevant
- named range / playback range info if available and useful
- layer flattening/export behavior made explicit

Codex should keep the schema small, stable, and readable.

### 3) Export modes
Provide explicit export modes.

Recommended:
- Export Current Frame
- Export All Frames
- Export Selected Frame Range (if a range is active)

Optional only if clean:
- Export Playback Range

These modes should be clear in the UI/command system and deterministic.

### 4) Layer export behavior
Because the editor now supports layers, export behavior must be explicit.

Preferred MVP:
- exported image assets use composited visible frame result
- hidden layers do not export
- solo state is editor/runtime state only and should not silently corrupt export intent

Codex should choose one clear export rule and keep it consistent.

### 5) Palette-aware metadata
If palette information is already available in the document/editor state, include lightweight palette metadata in export JSON when practical:
- preset name if known
- palette colors in use or active palette list if already easy

Do not overbuild a full asset manifest system in v5.1.

### 6) Export access model
Do NOT add a new permanent top-bar control cluster.

Use one or more of:
- existing File menu
- command palette
- compact export popover from File
- context-aware export entry

This is important because the screen is already crowded.

### 7) Command palette integration
Add first-class commands for at least:
- Export: Sprite Sheet PNG
- Export: Animation JSON
- Export: Export Package
- Export: Current Frame
- Export: All Frames
- Export: Selected Range

These commands must be:
- searchable
- rankable
- alias-aware
- favorite-able
- macro-compatible

### 8) Save/export safety
Exports should not mutate editor state.
If an export configuration is incomplete or invalid, fail safely with lightweight status feedback.

### 9) Backward compatibility
Existing editor save/load must remain intact.
Export metadata should be additive and should not break the editor document format.

### 10) Engine-friendly output
Keep output naming and structure practical for the repo workflow.

Preferred:
- deterministic filenames
- stable JSON structure
- no hidden dependence on editor-only transient state

If a compact manifest is added, it should be simple enough to consume from the game repo without heavy parsing logic.

### 11) Range/timeline consistency
Exports using selected range or playback range must:
- respect current frame ordering
- remain correct after batch operations
- not depend on hover preview or transient playback state

### 12) UI discipline
Do not destabilize:
- top bar menu cleanup
- context-aware panels
- timeline
- layer panel
- playback controls
- command palette
- overflow/popover behavior

This PR is for export capability, not new clutter.

## Validation
- Sprite sheet export works
- Animation JSON export works
- Export package metadata works
- Current-frame export works
- All-frames export works
- Selected-range export works when range exists
- Exported frames respect composited visible layer result
- Exports do not mutate editor state
- Command palette export commands work
- No layout regression
- No console errors

## Scope
tools/*
docs/*
