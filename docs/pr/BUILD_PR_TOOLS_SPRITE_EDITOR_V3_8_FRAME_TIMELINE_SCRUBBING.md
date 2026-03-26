Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V3_8_FRAME_TIMELINE_SCRUBBING.md

# BUILD_PR — Sprite Editor v3.8 (Frame Timeline Strip + Scrubbing)

## Objective
Add a canvas-native frame timeline strip so animation workflows become visual, fast, and easy to scrub, while preserving the current architecture.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing frame selection, reordering, history, rendering, and command systems

## Requirements

### 1) Canvas-native timeline strip
Add a dedicated frame timeline strip inside the canvas layout.

Each frame entry should show:
- small thumbnail preview
- frame index
- active frame highlight

Optional if clean:
- compact frame label / name

### 2) Click selection
Clicking a frame in the timeline must:
- switch active frame immediately
- update preview/onion-skin context correctly
- NOT create a history entry

### 3) Scrubbing
Support visual scrubbing:
- dragging or sliding across frame entries should update the active frame as the pointer moves
- feedback should feel immediate and predictable

Codex may choose exact input behavior, but it must be fast and deterministic.

### 4) Drag reorder
Support dragging a frame thumbnail to reorder frames within the timeline.

Requirements:
- show a visible drag placeholder/target
- drop commits the reorder
- reuse existing frame reorder logic where possible
- resulting reorder must remain undoable as one history action

### 5) Active frame clarity
The current frame must remain clearly indicated even during scrubbing and drag-reorder interactions.

### 6) Thumbnail rendering
Timeline thumbnails should be lightweight:
- cached if practical
- reused from existing preview logic if practical
- avoid expensive full redraw patterns every frame

Codex may choose the simplest performant implementation.

### 7) Command integration
Ensure timeline-related frame navigation remains compatible with:
- existing frame next/previous commands
- command palette usage
- keyboard shortcuts

Optional if lightweight:
- add command labels aligned with timeline language

### 8) History behavior
- selecting/scrubbing frames is view/navigation state only and should not create history entries
- reordering frames must create one undoable history entry
- no history corruption during drag interactions

### 9) No architecture drift
Do not:
- add DOM timeline UI
- bypass command/history systems
- split control authority away from SpriteEditorCanvasControlSurface

## Validation
- Timeline strip renders correctly
- Clicking a frame selects it
- Scrubbing updates active frame smoothly
- Drag reorder works
- Reorder is undoable
- Active frame highlight remains clear
- No obvious performance regressions
- No console errors

## Scope
tools/*
docs/*
