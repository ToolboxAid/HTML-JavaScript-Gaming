Toolbox Aid
David Quesenberry
04/03/2026
PLAN_PR_SPRITE_EDITOR_USABILITY_POLISH.md

# PLAN_PR_SPRITE_EDITOR_USABILITY_POLISH

## Goal
Plan a small, surgical usability-polish PR for the isolated Sprite Editor at `tools/Sprite Editor V3/` now that core features are working.

## Confirmed baseline (locked)
- draw / erase / fill
- frames
- onion skin
- PNG import/export
- JSON save/load
- sprite-sheet export
- animation preview
- grid toggle
- configurable canvas width/height in pixels
- configurable pixel size / zoom

## Scope rules (locked)
- Do not review, modify, migrate, or delete any pre-existing sprite editor outside `tools/Sprite Editor V3/`.
- Keep scope limited to `tools/Sprite Editor V3/`, `tools/index.html` only if needed, and docs/reports.
- Do not expand into engine or unrelated tools.
- Docs-first.
- One PR per purpose.
- Preserve required file headers.
- No destructive changes.

## In scope
- Usability-only polish in `tools/Sprite Editor V3/`:
  - visibility and feedback improvements
  - keyboard shortcut support
  - undo/redo behavior
  - status and preview clarity
  - save/load and import/export UX messaging
  - cursor/status bar observability
- Docs/reports for BUILD/APPLY workflow.

## Out of scope
- Any engine changes
- Any unrelated tool changes
- Any sample/game changes
- Any rewrite/refactor outside targeted usability polish
- Any changes to legacy/pre-existing sprite-editor directories

## Exact files likely to change in BUILD_PR
Primary code targets:
- `tools/Sprite Editor V3/index.html`
- `tools/Sprite Editor V3/spriteEditor.css`
- `tools/Sprite Editor V3/main.js`
- `tools/Sprite Editor V3/modules/spriteEditorApp.js`
- `tools/Sprite Editor V3/modules/projectModel.js` (only if needed for undo/redo snapshot contract)
- `tools/Sprite Editor V3/modules/constants.js`
- `tools/Sprite Editor V3/modules/colorUtils.js` (only if needed for recent swatch behavior)
- `tools/Sprite Editor V3/README.md`

Optional integration target:
- `tools/index.html` (only if a tiny non-destructive description tweak is needed)

Required docs/report targets:
- `docs/pr/BUILD_PR_SPRITE_EDITOR_USABILITY_POLISH.md`
- `CODEX_COMMANDS.md`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/dev/reports/file_tree.txt`

## UX behavior contract by polish item
1. Better tool-state visibility
- Contract: persistent top-level state row always shows active tool, active color hex, active frame index/count, and grid/onion status.
- Contract: active tool button and active swatch remain visibly highlighted at all times.
- Contract: state row updates immediately after click or shortcut actions.

2. Keyboard shortcuts
- Contract: single-key shortcuts while focus is not in a text/number/color/file input.
- Mapping: `P` pencil, `E` eraser, `F` fill, `G` grid toggle, `O` onion toggle, `[` previous frame, `]` next frame.
- Contract: each shortcut emits clear status text (example: "Tool set to Eraser").
- Contract: no browser-destructive overrides (no hijacking save/open tabs, etc.).

3. Undo/redo plan
- Contract: history stack tracks draw, erase, fill, frame operations, import, resize/new-canvas actions.
- Mapping: `Ctrl+Z` undo, `Ctrl+Y` redo (plus `Ctrl+Shift+Z` redo).
- Contract: bounded history depth (for example 50 states) to keep memory predictable.
- Contract: undo/redo status always reports resulting frame and action summary.

4. Resize/new-canvas behavior clarity
- Contract: `Create New Canvas` explicitly resets content to a fresh single-frame document.
- Contract: width/height input resize preserves existing pixels by nearest-neighbor remap unless user selects reset flow.
- Contract: status message states whether action was "reset" vs "preserve/resize".
- Contract: README includes this behavior so it is not ambiguous.

5. Import/export feedback messaging
- Contract: all import/export actions report success/failure with filename and relevant dimensions/frame count.
- Contract: PNG import mismatch states whether resize prompt was accepted or declined.
- Contract: error messages are plain-language and actionable.

6. Recent-color swatch behavior
- Contract: recent swatches are deduplicated, newest-first, and capped (existing cap preserved unless explicitly changed).
- Contract: selecting a swatch updates active color + highlights both recent and palette states when color exists in both.
- Contract: transparent swatch is visually distinguishable.

7. Preview panel polish (FPS/play/pause clarity)
- Contract: preview controls expose explicit play and pause/stop semantics.
- Contract: FPS value always visible and synchronized with slider.
- Contract: status text includes preview state transitions and current FPS.

8. Optional status bar
- Contract: lightweight status bar shows canvas size, zoom, active frame, and live cursor pixel position when on canvas.
- Contract: cursor position clears or shows placeholder when cursor leaves canvas.
- Contract: this remains optional and should be skipped if it risks scope expansion.

9. Mouse drag reliability
- Contract: drag drawing must not drop pixels during normal-speed pointer movement.
- Contract: line interpolation remains enabled between last and current drag points.
- Contract: pointer-capture lifecycle remains robust through pointer cancel/up.

10. Save/load UX cleanup
- Contract: save filename defaults include size/frame metadata.
- Contract: load success restores controls (size, zoom, toggles, frame state) with explicit status confirmation.
- Contract: load failure leaves current project untouched.

## Manual validation checklist for BUILD/APPLY
- Open `tools/Sprite Editor V3/index.html` directly in browser.
- Confirm active state row visibility and correctness.
- Confirm shortcut mappings (`P`, `E`, `F`, `G`, `O`, `[`, `]`) with status feedback.
- Confirm undo/redo on draw, fill, frame ops, and import/resize actions.
- Confirm new-canvas reset behavior and resize-preserve behavior are both clear and correctly messaged.
- Confirm import/export messages include filename and dimensions/frame context.
- Confirm recent swatches are deduped, newest-first, and correctly highlighted.
- Confirm preview play/pause/FPS clarity and status updates.
- If status bar is implemented, confirm canvas size, zoom, frame, and cursor position update correctly.
- Stress test drag drawing to verify interpolation reliability.
- Save JSON and reload; verify UI control restoration and status messages.
- Confirm `tools/index.html` link remains correct for `tools/Sprite Editor V3/index.html`.
- Confirm no edits outside approved file list.

## BUILD_PR command
`Create BUILD_PR_SPRITE_EDITOR_USABILITY_POLISH.`

Required BUILD constraints:
- Apply only this plan.
- Keep PR small and surgical.
- No changes outside `tools/Sprite Editor V3/` + docs/reports (+ `tools/index.html` only if strictly needed).
- Do not touch any pre-existing sprite editor implementation outside `tools/Sprite Editor V3/`.
- No engine/unrelated tool/samples changes.
- Preserve file headers and docs-first workflow.
- Produce delta zip: `tmp/BUILD_PR_SPRITE_EDITOR_USABILITY_POLISH_delta.zip`.

## Commit comment (for BUILD_PR)
`BUILD_PR_SPRITE_EDITOR_USABILITY_POLISH: improve isolated Sprite Editor usability (state visibility, shortcuts, undo/redo, feedback clarity) without scope expansion`

## Next command
`APPLY_PR_SPRITE_EDITOR_USABILITY_POLISH`
