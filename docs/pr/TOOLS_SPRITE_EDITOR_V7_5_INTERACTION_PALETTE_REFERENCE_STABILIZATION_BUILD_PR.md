# TOOLS_SPRITE_EDITOR_V7_5_INTERACTION_PALETTE_REFERENCE_STABILIZATION_BUILD_PR

## Purpose
Execute the approved V7.5 Sprite Editor-only stabilization pass.

This BUILD_PR converts the approved plan into an implementation-ready scope for Codex.

## Scope
Modify Sprite Editor only.

Allowed:
- `tools/SpriteEditor/**`

Not allowed:
- `/engine/**`
- unrelated games / samples / tools

## Required Implementation Buckets

### 1. Interaction correctness
Implement:
- menu item click closes active menu correctly after action
- selection move stays non-destructive until commit / unselect
- Backspace cancels active interaction when not typing
- clear selection has explicit non-ESC path
- copy/paste/select flow may temporarily enter selection flow and then return to prior tool when appropriate

### 2. Files/export cleanup
Implement:
- flatten Files/Export structure
- keep direct useful items:
  - Export Sprite
  - Export GIF
  - Export Project JSON
- remove low-value submenu clutter per approved plan
- preserve New / Open / Save / Import/Export project behavior

### 3. Frame/timeline stabilization
Implement:
- Add Frame inserts after current frame
- playback range works correctly or is removed from UI
- clicking timeline frame always syncs Animation Preview

### 4. Layer system cleanup
Implement:
- rename flow supports normal editing including Backspace
- row layout spacing improved
- usable opacity control in row form
- no layer bleed into animation preview
- remove redundant/unclear layer actions already identified in QC
- keep top layer painting over lower layers

### 5. Palette completion
Implement:
- blocked first-edit palette enforcement shows popup + red status
- palette lock stays enforced
- clone action renamed to shorter approved form
- clone action unavailable until palette selected
- clone dropdown added in right sidebar between Palette and Current readouts
- clones visible/selectable/editable/persistent
- `default` appears in preset list
- swatch highlight animates continuously
- sidebar sort remains sidebar-owned only

### 6. Palette utility clarity
Implement:
- Help -> Palette explains:
  - Set Src From Current
  - Set Dst From Current
  - Scope Active Layer
  - Scope Current Frame
  - Scope Selected Range
- palette utility actions give visible feedback/status

### 7. Command palette cleanup
Implement:
- no underlay into Animation Preview
- no overlap artifacts
- no ESC-close references in UI/help
- keep top-layer clean rendering

### 8. Help/About completion
Implement:
- Help text matches current UI
- include Palette topic
- include middle-mouse pan help if feature exists
- About remains concise and link-focused

### 9. Reference image stabilization
Implement:
- Load Reference Image works
- image renders behind grid
- Fit to Grid works
- Reset Alignment works
- Auto-align attempt runs after load
- zoom/pan keep image aligned with grid
- persistence works if supported safely; otherwise degrade visibly/safely without breaking load/open

### 10. Timing/export consistency
Implement:
- GIF timing remains aligned with preview timing
- FPT/FPS placement remains correct
- playback/export timing uses current intended logic

## Guardrails
- No engine changes
- No architecture rewrite
- Preserve load/open behavior
- Keep changes surgical
- If a requested item risks broadening scope too far, keep it local or defer rather than touching engine/shared systems

## Acceptance Targets
- menus close correctly on action
- selection move non-destructive until commit/unselect
- Backspace cancel works
- Files menu flatter/clearer
- Add Frame inserts after current frame
- playback range works or is removed
- timeline click syncs preview
- layer rename/edit works with Backspace
- opacity control usable
- no layer bleed into preview
- palette lock popup + red status appear
- clone workflow visible/selectable/editable/persistent
- default preset visible
- swatch highlight animates continuously
- Help explains palette utility actions
- command palette visuals clean
- About/Help current
- reference image works end-to-end or degrades safely/visibly
- GIF timing aligned
- no `/engine` changes
- no load/open regression
- no console errors
