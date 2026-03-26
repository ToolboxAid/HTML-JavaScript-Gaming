Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V4_6_PLAYBACK_RANGE_LOOP_SEGMENT_PREVIEW_SCRUB.md

# BUILD_PR — Sprite Editor v4.6 (Playback Range + Loop Segment + Preview Scrub)

## Objective
Refine the animation workflow by adding playback range control, loop-segment playback, and lightweight timeline hover preview, while preserving the current canvas-native architecture and keeping transport behavior deterministic.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing timeline, playback, onion-skin, command, status, and history systems
- Keep transport/range state out of undo/redo history unless Codex has a compelling reason otherwise

## Requirements

### 1) Playback range model
Add a lightweight playback range concept.

Minimum state:
- playbackRange.startFrame
- playbackRange.endFrame
- rangeEnabled or equivalent explicit state

Codex may choose the exact structure, but it must be centralized and deterministic.

### 2) Loop segment playback
Playback should be able to loop only within the selected playback range.

Expected behavior:
- when range mode is enabled, playback loops from startFrame to endFrame
- when range mode is disabled, playback behaves as it does today across the full frame list
- range bounds should clamp safely if frame counts change after batch edits

### 3) Range setting UX
Add a lightweight way to define the playback range.

Acceptable approaches:
- use the current multi-frame range selection as the playback range source
- add explicit commands such as:
  - Set Playback Range to Selection
  - Clear Playback Range
- or another minimal canvas-native approach that remains clear and deterministic

Preferred:
- reuse selected frame range when practical
- avoid introducing a large second range model unless needed

### 4) Timeline visual clarity
Timeline should clearly show:
- active frame
- selected frame range (existing)
- playback range / loop segment

These should be visually distinguishable.

### 5) Preview scrub
Add lightweight timeline hover preview / scrub awareness.

Expected behavior:
- hovering a timeline frame may show preview focus without changing persistent history state
- optional ghost/highlight preview is acceptable
- if Codex implements a true hover-preview frame change, it must reset cleanly when hover ends unless selection is committed

Keep this simple and non-disruptive.

### 6) Playback integration
Playback head and timeline must stay coherent:
- active frame highlight updates during playback
- loop restarts respect range bounds
- scrubbing/selection while paused remains correct
- preview scrub does not corrupt playback state

### 7) Command palette integration
Add first-class commands for at least:
- Playback: Set Range From Selection
- Playback: Clear Range
- Playback: Toggle Range Loop

Optional if clean:
- Playback: Jump to Range Start
- Playback: Jump to Range End

Commands must be:
- searchable
- rankable
- alias-aware
- favorite-able
- macro-compatible

### 8) Keyboard integration
Keyboard shortcuts are optional unless clean and conflict-free.
Do not force them if they destabilize existing controls.

### 9) Status/readout
Bottom status/readout should clearly surface:
- whether playback range is active
- current range bounds
- hover/preview state if helpful and lightweight

### 10) History behavior
Playback range and hover preview are transport/editor-state behavior and should not pollute undo/redo history in the MVP unless Codex finds a strong reason otherwise.

### 11) Safety behavior
Invalid/no-op range actions must fail safely.

Examples:
- setting range with no meaningful selection
- range bounds outside current frame count after deletion
- clearing an already-cleared range

Provide lightweight status feedback and avoid no-op history pollution.

### 12) UI discipline
Do not destabilize:
- right panel layout
- playback controls
- onion-skin UI
- layer panel
- command palette
- overflow behavior

Keep the implementation tight.

## Validation
- playback range can be set
- playback loops within range correctly
- clearing range restores full playback
- timeline shows playback range clearly
- preview scrub/hover feedback works
- playback/timeline remain coherent after frame batch operations
- range commands appear in command palette
- no undo/redo pollution from transport state
- no console errors

## Scope
tools/*
docs/*
