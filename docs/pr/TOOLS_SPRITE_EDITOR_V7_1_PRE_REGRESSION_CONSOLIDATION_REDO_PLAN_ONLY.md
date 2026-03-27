# TOOLS_SPRITE_EDITOR_V7_1_PRE_REGRESSION_CONSOLIDATION_REDO_PLAN_ONLY

## Purpose
Redo the V7.1 consolidation as a PLAN ONLY after rollback.

This plan is intentionally constrained so Codex fixes the remaining Sprite Editor issues **without changing engine code** and **without breaking load/open behavior again**.

## Non-Negotiable Constraints
- PLAN ONLY — no code in this deliverable
- Codex may modify:
  - `tools/SpriteEditor/main.js`
  - Sprite Editor-local assets or docs only if truly required
- Codex may NOT modify:
  - `/engine/`
  - shared engine systems
  - reusable engine utilities
  - unrelated samples/games
- Do not solve Sprite Editor issues by changing engine architecture
- Protect existing load/open behavior first

## Regression Guardrail
The last attempt was rolled back because it broke load and Codex wanted to change engine code to compensate.

For this redo:
1. Preserve the current working load/open path exactly unless a Sprite Editor-local fix is strictly required
2. If a proposed fix risks load/open, defer that fix rather than broadening scope
3. No engine-side workaround is allowed

## Scope
This is a focused pre-regression consolidation pass for **Sprite Editor only**.

## Required Work Buckets

### 1. Files workflow stabilization
Goal: make Files menu complete and testable without breaking load.

Required outcomes:
- Add/restore visible `New`
- Add/restore visible `Open`
- Add/restore visible `Save`
- Keep `Export`
- Keep `Nothing to save.` behavior when clean

Guardrails:
- Do not rewrite the document serialization format
- Do not move save/load responsibilities into engine code
- Do not change file format unless already required by current Sprite Editor logic

Validation target:
- `Open` still works after patch
- `Save` still works after patch
- `New` safely resets editor state

### 2. Selection workflow cleanup
Goal: make selection understandable and safe.

Required outcomes:
- keep selection move data-safe
- add a clear selection-clear path if missing
- keep selection-related Edit items grouped together
- do not clear source pixels during preview move

Guardrails:
- no engine changes
- no broad rewrite of editor interaction model outside Sprite Editor

### 3. Brush cap adjustment
Goal:
- raise brush cap from 5 to 9

Guardrails:
- localized editor/tool config change only

### 4. Layer system correctness pass
Goal: fix the known layer correctness issues.

Required outcomes:
- no layer name/opacity overlap after duplicate
- upper layers paint over lower layers
- remove or clarify redundant/unclear layer actions:
  - remove redundant `Toggle Visibility` menu item if row controls already own this
  - remove `Solo` unless it is clearly useful and correctly implemented
- if show/hide text remains, it must update correctly
- animation preview must not show incorrect multi-layer contamination

Guardrails:
- do not alter engine render architecture
- keep changes local to Sprite Editor layer ordering / preview composition

### 5. Palette/help/readout cleanup
Goal: finish palette usability without changing engine code.

Required outcomes:
- Help includes `Palette`
- current color line stays on one line:
  `Current: #AABBCC [■] Named: Sky Blue`
- keep full palette scrolling
- keep palette sort controls intact

Guardrails:
- do not reintroduce palette cap
- do not move palette ownership out of Sprite Editor

### 6. About cleanup
Goal:
- remove extra internal content below the intended About content
- add visible links for:
  - `toolboxaid.com`
  - `github.com/ToolboxAid/HTML-JavaScript-Gaming`

Guardrails:
- Sprite Editor UI only
- no unrelated site/app changes

### 7. Command palette cleanup
Goal:
- remove any remaining ESC-close behavior
- fix text/glyph overlap artifacts
- keep command palette readable and top-layer

Guardrails:
- no Ctrl+W restore
- no engine-level overlay changes

### 8. Sheet Preview / preview layout cleanup
Goal:
- enlarge Sheet Preview to use available height better
- keep Frames / Order aligned beside it
- move FPS controls into animation preview under Frame if still separate

Guardrails:
- no sprite-sheet generation logic rewrite
- presentation/layout only unless a local Sprite Editor preview bug must be fixed

### 9. Help completeness
Goal:
- add Palette help topic
- add middle-mouse pan help if that feature exists
- ensure Help text matches the actual current UI

## Out of Scope
Do NOT do any of the following in this pass:
- engine refactors
- shared renderer changes
- reusable engine utility changes
- sample/game updates
- serialization redesign
- broad command/input architecture rewrite
- feature expansion unrelated to known QC findings

## Delivery Shape for Codex
Codex should treat this as one BUILD/APPLY pass for Sprite Editor only, with changes kept surgical and grouped by the buckets above.

## Acceptance Criteria
A successful V7.1 redo means:

### Files / load safety
- `Open` works
- `Save` works
- `New` works
- no load regression introduced

### Interaction / editing
- selection move is safe
- clear selection path exists and is understandable
- brush cap reaches 9

### Layers
- layer text no longer overlaps opacity
- upper layers paint over lower layers
- redundant/unclear Solo/Toggle Visibility issue is resolved
- animation preview is not contaminated by incorrect layer state

### Palette / help / readout
- Palette help exists
- current color line is one-line and readable
- palette scrolling still reaches the true end
- palette sorts still work

### Command palette / About / preview
- command palette has no ESC-close and no overlap artifacts
- About is cleaned up and links are visible
- Sheet Preview is larger and aligned better

### General
- no console errors
- no engine files changed

## Recommended Execution Order
1. Files/load-safe fixes first
2. Selection + brush cap
3. Layer correctness
4. Palette/help/readout
5. About + command palette cleanup
6. Sheet Preview / FPS placement
7. final sanity pass:
   - load/open
   - save
   - palette
   - layers
   - command palette
   - preview

## Final Note
If Codex encounters a fix that appears to require engine changes, the correct action is:
- stop broadening scope
- keep the issue local to Sprite Editor
- defer that fix rather than changing engine code
