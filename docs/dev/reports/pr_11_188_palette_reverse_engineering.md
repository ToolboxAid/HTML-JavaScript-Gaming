# PR 11.188 Palette Reverse Engineering Report

## Purpose
Reverse engineer the legacy Palette Browser, preserve it as `tools/Palette Browser-v1/`, and rebuild `tools/Palette Browser/` as the first clean session-backed Tool v2 implementation.

## Legacy Files Inspected
Inspected before replacing the active folder:

- `tools/Palette Browser/index.html`
- `tools/Palette Browser/main.js`
- `tools/Palette Browser/paletteBrowser.css`
- `tools/Palette Browser/README.md`
- `tools/Palette Browser/how_to_use.html`
- `tools/Palette Browser/assets/images/preview.svg`

Immediate legacy input dependencies inspected for contract evidence only:

- `tools/shared/paletteDocumentContract.js`
- `src/engine/paletteList.js`

## Legacy Folder Preservation
The legacy implementation was moved by safe copy-then-replace because Windows denied a direct folder rename while the folder was likely held open by another process.

Result:

```text
tools/Palette Browser-v1/
```

contains the legacy Palette Browser files, including the old platform shell entry, legacy CSS, README, how-to file, and preview asset.

## Legacy Inputs
Observed legacy inputs and data paths:

- `paletteJson` style data was normalized indirectly through `normalizePaletteDocument()` and `validatePaletteDocument()`.
- Legacy built-in palettes came from `src/engine/paletteList.js` via global `palettesList`.
- Custom palettes were stored in `localStorage` under `toolboxaid.paletteBrowser.customPalettes`.
- Hidden built-in palette ids were stored in `localStorage` under `toolboxaid.paletteBrowser.hiddenBuiltins`.
- Shared palette state was read/written through `assetUsageIntegration.js` handoff helpers.
- Query loading existed through `samplePresetPath` and diagnostics helpers.
- Workspace detection depended on URL params, referrer, parent path checks, and shared handoff state.
- Import/export/copy actions accepted broader palette document shapes through legacy normalization.

Required focus for the rebuilt contract:

```text
paletteJson.name
paletteJson.colors[]
```

A displayable color must provide an explicit `#RRGGBB` or `#RRGGBBAA` value. The rebuilt contract accepts string color entries and object entries with an explicit `hex` field because those were the explicit color forms observed in the legacy palette paths.

## UI Sections Found
Legacy UI sections found:

- Collapsible platform shell/header region.
- Left Palette List panel with launch context, search, count, and palette list.
- Center Palette Preview panel with selected palette title, swatches, palette name input, swatch color/name/symbol controls, palette actions, and swatch actions.
- Right Actions & Validation panel with JSON preview, validation summary, import/export/copy/use-in-workspace controls, and handoff status text.

## Behavior To Keep Conceptually
Kept conceptually in the clean rebuild:

- Visible tool name: `Palette Browser / Manager`.
- Palette name display.
- Swatch rendering.
- Swatch count display.
- Explicit empty state when no session palette exists.
- Explicit malformed/error state when session palette data violates the contract.
- Validation readout for the active session contract.

## Behavior To Delete
Deleted from the rebuilt active tool:

- `platformShell` usage.
- `assetUsageIntegration` usage.
- Shared handoff reads/writes.
- Built-in palette fallback loading.
- `localStorage` custom palette loading.
- Query-driven sample preset loading.
- Import/export/copy/edit/delete/new/duplicate palette workflows.
- Workspace auto-open behavior.
- Legacy broad schema normalization.
- Tool id alias dependencies.

## Legacy Systems Avoided
The rebuilt `tools/Palette Browser/` and new `tools/common/` files do not import or call:

- `tools/shared/platformShell.js`
- `tools/shared/assetUsageIntegration.js`
- shared handoff modules
- shared palette document normalization modules
- tool alias registries
- samples or games

## Final Tool Contract
The rebuilt Palette Browser reads only session-backed `paletteJson`.

Supported session sources:

1. Workspace URL writes session and launches tool with `hostContextId`; the tool reads `toolboxaid.toolHost.context.<hostContextId>` from `sessionStorage`.
2. Tool URL provides explicit `paletteJson` or `paletteData`; `tools/common/sessionContext.js` writes that explicit data to session first, then returns the session-backed record.
3. Tool URL provides explicit `paletteUrl`; `tools/common/sessionContext.js` fetches that explicit URL, writes the result to session first, then returns the session-backed record.

Accepted `paletteJson` shape:

```text
paletteJson.name: non-empty string
paletteJson.colors: array
paletteJson.colors[]: string #RRGGBB/#RRGGBBAA or object with hex #RRGGBB/#RRGGBBAA
```

No fallback/default palette data is provided.

## Sidebar Accordion Control Type Plan
Initial Palette-first control groups:

### Context
Implemented as read-only session source/context display.

Needed controls/readouts:

- session found/missing
- source path
- context id

### Palette
Implemented as read-only palette display.

Needed controls/readouts:

- palette name
- color count
- swatch grid

### Display
Implemented as fixed display only.

Needed controls/readouts:

- responsive swatch cards
- visible hex/name/symbol values

Deferred, not implemented:

- display density controls
- sort controls
- color-space toggles

### Validation
Implemented as read-only contract validation.

Needed controls/readouts:

- valid/invalid contract state
- error messages for malformed session data

### Workspace
Implemented as read-only workspace/session status.

Needed controls/readouts:

- workspace/session context status

Deferred, not implemented:

- workspace session mutation controls
- import/export controls
- palette selection handoff controls

## Menu Plan
The rebuilt tool has two menu zones:

```text
menuTool
menuWorkspace
```

`menuTool` contains read-only session and contract launch information for the current tool.

`menuWorkspace` contains read-only workspace/session status only. No workspace mutation, import, or export controls are exposed in this PR.

## Files Created Or Rebuilt
- `tools/Palette Browser-v1/**` preserves the legacy implementation.
- `tools/Palette Browser/index.html` clean active Palette Browser shell.
- `tools/Palette Browser/main.js` class-based session reader/renderer.
- `tools/Palette Browser/styles.css` active Palette Browser styling.
- `tools/common/toolLayout.css` shared clean tool layout foundation.
- `tools/common/sessionContext.js` session-backed context reader/writer.
- `tools/common/toolContract.js` narrow palette contract validator.

## Validation Results
Targeted validation run:

```powershell
node --check "tools/common/sessionContext.js"
node --check "tools/common/toolContract.js"
node --check "tools/Palette Browser/main.js"
```

Results:

- `node --check "tools/common/sessionContext.js"` passed.
- `node --check "tools/common/toolContract.js"` passed.
- `node --check "tools/Palette Browser/main.js"` passed.

Additional targeted inspection:

```powershell
rg -n "platformShell|assetUsageIntegration|shared/|handoff|v2|V2" "tools/Palette Browser" "tools/common"
```

Result: only required lifecycle log labels contain `V2`; no platformShell, assetUsageIntegration, shared import, or handoff references remain in the rebuilt active tool/common files.

Targeted browser/tool launch check: not run. No existing automated Palette Browser browser harness was found in scope, and the requested validation was syntax-only.

## Full Samples Smoke Decision
Skipped - targeted Palette Browser and new `tools/common/` foundation changes only; no broad shared sample loader change was made.

## Roadmap Decision
`docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` was left untouched. Existing palette roadmap entries relate to older palette data completeness/normalization work, not an exact Tool v2 or Palette v2 rebuild status item, so no status-only marker update was appropriate.
