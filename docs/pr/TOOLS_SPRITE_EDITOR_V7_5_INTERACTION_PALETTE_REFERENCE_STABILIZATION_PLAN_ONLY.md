# TOOLS_SPRITE_EDITOR_V7_5_INTERACTION_PALETTE_REFERENCE_STABILIZATION_PLAN_ONLY

## Purpose
Plan the next Sprite Editor-only stabilization pass after the latest QC defects.

This pass focuses on:
- interaction correctness
- palette workflow completion
- files/export cleanup
- layer/sidebar cleanup
- reference image stabilization

## Plan Only
This is PLAN_PR only.
ChatGPT defines the plan.
Codex writes code later.
No engine changes.

## Non-Negotiable Constraints
- Sprite Editor only
- Do NOT touch /engine
- Do NOT rewrite architecture
- Preserve current load/open behavior
- Keep canvas-native UI
- Prefer surgical fixes over new systems
- If a requested fix risks broadening scope, keep it local to Sprite Editor or defer it

## QC-Driven Defect Source
This plan is driven by the current defect log in:
- `QC - SPRITE_EDITOR_FINAL_QC.txt`

## Work Buckets

### 1. Interaction correctness (highest priority)
Fix the following:
- clicking menu items should close the current menu/dropdown correctly after action
- selection move must remain non-destructive until commit/unselect
- Backspace cancel must work when not typing
- selection clear must not depend on ESC
- copy/paste/select workflow should not force awkward manual tool switching:
  - copy/select operations should temporarily enable selection flow if needed
  - after action, return to prior tool when appropriate

Specific outcomes:
- menu item click behavior is consistent
- selection move no longer clears pixels underneath during preview
- Backspace cancel works for active interactions
- clear selection has an explicit non-ESC path

### 2. Files/export cleanup
Current Files flow has low-value sub-submenu structure.

Required cleanup:
- flatten Export structure
- keep useful direct actions at Files level:
  - Export Sprite
  - Export GIF
  - Export Project JSON
- remove low-value or redundant export branches if they provide no value:
  - Export animation json
  - Export package
  - mode current frame / all frames / selected range if these are only submenu clutter and not needed
- keep Import Project JSON if currently used and valuable
- preserve load/open/save behavior

Specific outcome:
- Files menu is simpler, direct, and testable

### 3. Frame/timeline stabilization
Fix:
- Add Frame should insert after the currently selected frame
- playback range must actually constrain playback or be removed/disabled
- clicking a timeline frame should always sync the animation preview correctly

Specific outcome:
- frame actions match user expectation
- timeline click and preview are consistent
- range is either truly functional or not exposed

### 4. Layer system cleanup
Fix:
- rename flow should support normal editing behavior including Backspace
- layer row layout spacing should be improved
- add explicit opacity control in row form:
  - `[-] xxx% [+]`
- layer order/render order must remain correct
- prevent layers from leaking into animation preview
- remove redundant/unclear layer menu items already identified

Specific outcome:
- layers are readable, editable, and visually isolated from preview areas

### 5. Palette system completion
Fix:
- blocked first-edit palette enforcement must show both popup and red status message
- palette lock after selection must remain enforced
- custom palette clone should be renamed from:
  - `Create Custom Palette Clone`
  to a shorter form such as:
  - `Custom Palette Clone`
  or
  - `Clone Palette`
- clone action should not be selectable until palette is selected
- add a clone dropdown in the right sidebar between:
  - `Palette:`
  - `Current:`
- clones must be visible/selectable
- clone naming input must support Backspace correctly
- clone persistence after save/open must work
- clone editing independence must work
- `default` should appear in the palette preset list
- palette swatches should be doubled in size if needed to make true scroll behavior obvious
- animated swatch highlight must animate continuously, not only on pointer movement

Keep:
- sidebar sort controls only
- no duplicate sort controls in Palette menu

Specific outcome:
- palette lock + clone workflow is understandable and complete

### 6. Palette utility action clarity
The following actions need clear meaning and visible testability:
- Set Src From Current
- Set Dst From Current
- Scope Active Layer
- Scope Current Frame
- Scope Selected Range

Required work:
- document them clearly in Help -> Palette
- ensure visible feedback/status after each action
- keep them in Palette workflow only if they provide clear value
- if any are effectively dead/unusable, consider removing or deferring instead of keeping confusing controls

Specific outcome:
- user can understand what each action is for and how to validate it

### 7. Current color readout cleanup
Keep the one-line format but refine wording if needed.

Preferred line:
- `Current: #AABBCC [■] Named: Sky Blue`

If "Named Color" is preferred in UI, keep it on one line and compact.
Also keep the color swatch inline.

### 8. Command palette cleanup
Fix:
- command palette should not visually underlay animation preview
- remove remaining overlap artifacts (teal/white text, star/bracket remnants)
- remove ESC-close references from UI/help text
- keep it top-layer and clean

Specific outcome:
- command palette is visually stable and unambiguous

### 9. Help/About completion
Fix:
- add Palette topic if still missing
- add middle-mouse pan help if feature exists
- keep Help text aligned to actual current UI
- About should keep only intentional concise content and useful links

Specific outcome:
- Help and About match current product state

### 10. Reference image stabilization (high-risk isolated bucket)
Current QC indicates the feature is not actually working yet.

Treat this as an isolated stabilization bucket:
- Load Reference Image must actually load
- image must render behind grid
- Fit to Grid must work
- Reset Alignment must work
- Auto-align attempt must run after load
- zoom must keep image aligned with grid
- pan must keep image aligned with grid
- persistence after save/open should work if current implementation supports storing the needed state; if binary persistence is not safely implemented yet, preserve alignment/settings and clearly document limits instead of breaking load/save

Guardrails:
- keep all changes local to Sprite Editor modules
- do not solve by changing engine rendering/camera systems
- if image persistence is incomplete, degrade visibly/safely rather than silently failing

Specific outcome:
- reference image feature is either working end-to-end or clearly constrained and documented

### 11. Animation preview / FPT / GIF timing
Keep and verify:
- FPT/FPS under Frame X/Y in Animation Preview
- no duplicate FPS text in timeline strip
- GIF export uses current timing correctly
- GIF export uses playback order override when applicable

Specific outcome:
- preview timing and export timing remain aligned

### 12. Optional feature request (defer unless cheap and local)
User requested:
- nudge tool for all grid pixels left/right/up/down

This is NOT part of the must-fix stabilization pass unless it is trivial and isolated.
Default decision:
- defer to a later focused PR after stabilization

## Out of Scope
- engine changes
- broad serialization redesign outside Sprite Editor-local document/project data
- major architecture rewrites
- new reusable systems
- non-SpriteEditor repo changes

## Suggested Execution Order for Codex Later
1. interaction correctness
2. files/export cleanup
3. frame/timeline stabilization
4. layer system cleanup
5. palette lock/clone/sidebar completion
6. palette utility help/feedback clarity
7. command palette cleanup
8. help/about completion
9. reference image stabilization
10. final timing/export sanity for GIF/FPT

## Acceptance Criteria
A successful build from this plan means:
- menus close correctly on action
- selection move is non-destructive until commit/unselect
- Backspace cancel works
- Files menu is flatter and clearer
- Add Frame inserts after current frame
- playback range works or is removed
- timeline click always syncs preview
- layer rename/edit works cleanly
- opacity control exists in row form
- no layer bleed into preview
- palette lock shows popup + red status
- clone workflow is visible/selectable/editable/persistent
- default palette appears in preset list
- swatch highlight animates continuously
- palette utility actions are explained and testable
- command palette visuals are clean
- Help/About are complete and current
- reference image feature works end-to-end or clearly degrades safely
- GIF timing remains aligned with preview timing
- no engine files changed
- no console errors
