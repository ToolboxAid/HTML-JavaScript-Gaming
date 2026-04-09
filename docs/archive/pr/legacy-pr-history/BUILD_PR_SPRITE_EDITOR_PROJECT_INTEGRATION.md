Toolbox Aid
David Quesenberry
04/03/2026
BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION.md

# BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION

## Goal
Implement the approved Sprite Editor project integration contract from `PLAN_PR_SPRITE_EDITOR_PROJECT_INTEGRATION` with small, surgical changes in `tools/Sprite Editor/` only.

## Approved contract implemented
- Sprite Editor now consumes palette authority from engine `globalThis.palettesList` (loaded from `../../src/src/engine/paletteList.js`).
- No local hardcoded tool-authoritative palette catalog is used for selection flow.
- Editing remains disabled until a palette is selected.
- Palette selection locks for the active project/session.
- Palette switching is blocked after lock through normal interaction.
- `Create New Canvas` is the explicit reset/new-project unlock flow.
- Save JSON now persists `paletteRef` identity metadata.
- Load JSON restores/locks palette by `paletteRef.id` when resolvable; unresolved refs load in blocked palette-selection state.

## Operation-specific lock behavior
- New project (`Create New Canvas`): clears lock and requires new palette selection.
- Load existing JSON:
  - resolvable `paletteRef.id` -> auto-lock to that engine palette
  - missing/unresolvable `paletteRef.id` -> blocked mode until explicit palette selection
- PNG import: preserves current palette lock; no palette switching side effects.
- Resize canvas: preserves current palette lock.
- Duplicate frame: preserves current palette lock.
- Save/load flow: persists and restores palette reference identity safely.

## Scope boundaries honored
In scope:
- `tools/Sprite Editor/index.html`
- `tools/Sprite Editor/spriteEditor.css`
- `tools/Sprite Editor/README.md`
- `tools/Sprite Editor/modules/constants.js`
- `tools/Sprite Editor/modules/projectModel.js`
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- docs/reports for this BUILD

Out of scope:
- engine rewrites
- unrelated tools
- pre-existing sprite editor implementations outside `tools/Sprite Editor/`

## Validation summary
- Syntax checks passed:
  - `node --check tools/Sprite Editor/modules/spriteEditorApp.js`
  - `node --check tools/Sprite Editor/modules/projectModel.js`
  - `node --check tools/Sprite Editor/modules/constants.js`
- Palette-gating and lock flows implemented per plan contract.
- Save/load palette reference behavior implemented with unresolved-reference fallback to blocked mode.

## Packaging
- Delta ZIP: `tmp/BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION_delta.zip`
- ZIP includes only PR-relevant files.
