Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V3_9_PLAYBACK_TIMELINE_FPS_CONTROL.md

# BUILD_PR — Sprite Editor v3.9 (Playback Timeline + FPS Control)

## Objective
Complete the animation workflow by adding timeline-aware playback controls and adjustable FPS behavior, while preserving the existing canvas-native architecture.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing frame timeline, preview, command, keyboard, and status systems
- Keep playback controls lightweight and deterministic

## Requirements

### 1) Timeline-aware playback controls
Add canvas-native playback controls integrated into the current timeline/animation workflow.

Minimum controls:
- Play
- Pause
- Stop or Reset-to-first-frame

Optional if clean:
- Loop On/Off

These controls should fit naturally with the timeline/preview area and remain readable under current density/overflow rules.

### 2) FPS control
Add adjustable FPS support.

Requirements:
- expose current FPS clearly
- provide a lightweight way to increase/decrease FPS
- keep values clamped to a sane range (Codex may choose exact min/max, e.g. 1–30 or 1–60)
- changes should take effect immediately in playback

Acceptable interaction:
- +/- buttons
- compact stepper
- command-palette actions
- keyboard shortcuts if clean

### 3) Playback behavior
Playback should:
- advance frames in timeline order
- respect current frame count
- stop or loop predictably at the end depending on the chosen mode
- remain consistent with the existing preview/timeline system

Selection/scrubbing remains navigation state, not history.

### 4) Timeline integration
Timeline and playback should work together clearly:
- active frame highlight updates during playback
- scrubbing/selecting frames while paused should still work
- selecting a frame may optionally reposition playback head
- playback state should be visually clear

Codex should choose the simplest deterministic behavior and keep it consistent.

### 5) Command palette integration
Add first-class commands for:
- Play
- Pause
- Stop / Reset Playback
- Increase FPS
- Decrease FPS
- Toggle Loop (if implemented)

These must be:
- searchable
- rankable
- alias-aware
- favorite-able
- macro-compatible

### 6) Keyboard integration
Add or preserve lightweight keyboard support.
At minimum:
- Space or P may control play/pause if this can be done safely without breaking current shortcuts
- FPS adjustment shortcuts are optional if clean

Codex may keep the existing `P` playback shortcut and extend around it.

### 7) Status/readout
Add clear lightweight feedback for:
- playback state
- FPS
- loop state if implemented

This should fit into the current status/readout pattern without clutter.

### 8) History behavior
Playback controls and FPS changes are editor/view-state behavior and do not need to become undoable history actions unless Codex finds a compelling reason.
Do not pollute the undo/redo history with ordinary playback transport use.

### 9) Performance
Playback updates must remain lightweight.
Do not introduce expensive per-frame recomputation if simpler timeline/preview updates are sufficient.

## Validation
- Play works
- Pause works
- Stop/reset works
- FPS changes take effect immediately
- Timeline highlight updates during playback
- Scrubbing/selecting frames still works
- Loop behavior is predictable if implemented
- Commands appear in command palette
- No history pollution from transport controls
- No console errors

## Scope
tools/*
docs/*
