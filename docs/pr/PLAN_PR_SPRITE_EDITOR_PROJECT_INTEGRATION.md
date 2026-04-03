Toolbox Aid
David Quesenberry
04/03/2026
PLAN_PR_SPRITE_EDITOR_PROJECT_INTEGRATION.md

# PLAN_PR_SPRITE_EDITOR_PROJECT_INTEGRATION

## 1. Goals
- Integrate isolated Sprite Editor with engine-authoritative palette flow.
- Make engine palette list the single source of truth.
- Enforce palette-gated editing and palette lock semantics for project/session consistency.
- Define persistence contract for palette identity without duplicating palette authority.
- Keep implementation small, boundary-safe, and compatible with future tool pipeline alignment.

## 2. In Scope / Out of Scope
In scope:
- Sprite Editor integration planning for engine palette contract consumption.
- Disabled-until-palette-selected UX and locked-palette UX contracts.
- Save/load project palette identity contract.
- Error behavior contract when engine palette source is unavailable.
- Docs/reports bundle for PLAN stage.

Out of scope:
- Engine rewrites or new engine palette systems.
- Changes to pre-existing sprite editor implementations outside `tools/Sprite Editor/`.
- Unrelated tools or gameplay/runtime systems.
- Any destructive or migration-heavy repo changes.

## 3. Exact Files Likely To Change (for BUILD_PR)
Primary likely implementation files:
- `tools/Sprite Editor/index.html`
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- `tools/Sprite Editor/modules/projectModel.js`
- `tools/Sprite Editor/modules/constants.js`
- `tools/Sprite Editor/README.md`

Optional tiny integration point:
- `tools/Sprite Editor/main.js` (only if bootstrap wiring required)

Required BUILD docs/report files:
- `docs/pr/BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION.md`
- `CODEX_COMMANDS.md`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/dev/reports/file_tree.txt`

## 4. Engine Integration Contract For paletteList
Authoritative source:
- Engine-owned `engine/paletteList.js` exposes `globalThis.palettesList` / `window.palettesList`.

Tool integration rule:
- Sprite Editor reads palette sets from that engine contract only.
- Sprite Editor does not define a hardcoded tool-only authoritative palette catalog.

Boundary rule:
- Sprite Editor uses read-only consumption of engine palette data.
- No writes/mutations to `globalThis.palettesList`.
- No duplicated authority copy in tool modules.

Loading rule:
- If `globalThis.palettesList` is available and valid, build palette selector options from it.
- If unavailable/invalid, editor enters blocked mode (non-destructive, no editing) and presents actionable recovery message.

Expected contract shape consumed by Sprite Editor:
- paletteId -> array of entries
- each entry expected to expose at minimum a usable `hex` color value
- optional metadata (name/symbol) may be displayed but is not required for editing correctness

## 5. Disabled-Until-Palette-Selected Behavior Contract
Initial load state:
- Palette selector enabled.
- Editing actions disabled until palette selected.

Disabled actions before selection:
- draw/erase/fill interactions
- frame editing actions
- import PNG into frame
- resize/new-canvas actions that mutate document pixels
- export actions that rely on active edit context

Allowed actions before selection:
- palette selection
- load existing JSON project (to restore/resolve palette identity)
- read-only UI browsing and status/help interactions

UX messaging requirement:
- Status/readout must clearly state: "Select palette from engine list to enable editing."
- Disabled controls should appear visibly disabled, not silently ignored.

## 6. Locked-Palette Behavior Contract
Lock trigger:
- First successful palette selection on new session/project, or
- successful project load that resolves a saved palette identity to engine palette list.

Lock semantics:
- After lock, palette selector is read-only for that active project/session.
- User cannot switch to a different palette through normal interaction.

Explicit unlock flows (allowed):
- New Project flow (creates fresh project and clears prior lock)
- Approved reset/new-project action explicitly documented in UI

Operation-specific lock behavior:
- New Project: clears existing lock and requires new palette selection before edits.
- Load Existing JSON Project:
  - if saved paletteId resolves in engine list -> auto-lock to that palette.
  - if saved paletteId missing/unresolvable -> project loads into blocked palette-selection state; user must choose one palette, then it locks.
- PNG Import: uses current locked palette context; does not unlock or change palette.
- Resize Canvas: preserves current lock; no palette switching.
- Duplicate Frame: preserves current lock.
- Save/Load Flow: save records palette identity; load attempts restore and lock as above.

## 7. Save/Load Project Palette Contract
Saved JSON contract addition:
- Store palette reference block, not authoritative palette catalog copy.

Planned shape:
- `paletteRef.source = "engine/paletteList"`
- `paletteRef.id = <paletteId>`
- `paletteRef.locked = true`
- optional non-authoritative verification metadata (example: color count/signature) for diagnostics only

Load contract:
- Resolve `paletteRef.id` against engine palette list.
- On success: restore lock and enable editing.
- On failure: keep editing blocked until user selects palette; then write new lock in memory.

No-authority-duplication rule:
- Serialized project must not become an alternative palette authority source.
- Tool may store convenience metadata but engine palette list remains source of truth.

## 8. Manual Validation Checklist (for BUILD/APPLY)
- Confirm Sprite Editor loads engine palette list from engine contract path.
- Confirm no tool-local hardcoded authoritative palette list is used.
- Confirm editing is blocked on first load until palette selected.
- Confirm selecting palette enables editing and locks selector.
- Confirm palette cannot be changed during active project/session via normal controls.
- Confirm New Project clears lock and requires new selection.
- Confirm Load JSON with resolvable paletteRef auto-locks correctly.
- Confirm Load JSON with missing paletteRef enters blocked selection state.
- Confirm PNG import/resize/duplicate frame preserve lock.
- Confirm save JSON includes paletteRef identity fields.
- Confirm load/save messaging explains lock/resolution outcomes.
- Confirm no engine or unrelated tool files were changed beyond approved integration touchpoints.

## 9. BUILD_PR Command
`Create BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION.`

Required BUILD constraints:
- Implement only this approved plan.
- Keep PR small and surgical.
- Use engine palette contract as single authority.
- Do not modify pre-existing sprite editor implementations outside `tools/Sprite Editor/`.
- Do not introduce engine rewrites.
- Produce delta zip: `tmp/BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION_delta.zip`.

## 10. Commit Comment
`BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION: integrate isolated Sprite Editor with engine-authoritative palette contract and locked palette flow`

## 11. Next Command
`APPLY_PR_SPRITE_EDITOR_PROJECT_INTEGRATION`
