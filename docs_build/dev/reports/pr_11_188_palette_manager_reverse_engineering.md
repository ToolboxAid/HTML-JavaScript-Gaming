# PR 11.188 Palette Manager Reverse Engineering Report

## Purpose
Reverse engineer the legacy Palette Browser / Manager behavior, preserve the legacy implementation under `toolbox/Palette Browser-v1/`, and rebuild the route `toolbox/Palette Browser/` as the clean Tool v2 **Palette Manager** screen.

## Legacy Files Inspected
Legacy files inspected before rebuilding the active route:

- `toolbox/Palette Browser/index.html`
- `toolbox/Palette Browser/main.js`
- `toolbox/Palette Browser/paletteBrowser.css`
- `toolbox/Palette Browser/README.md`
- `toolbox/Palette Browser/how_to_use.html`
- `toolbox/Palette Browser/assets/images/preview.svg`

Immediate legacy input dependencies inspected for Palette behavior evidence only:

- `toolbox/shared/paletteDocumentContract.js`
- `src/engine/paletteList.js`

## Legacy Preservation
The legacy implementation is preserved at:

```text
toolbox/Palette Browser-v1/
```

The active route remains:

```text
toolbox/Palette Browser/
```

This preserves route continuity while changing the rebuilt visible product name to Palette Manager.

## Legacy Inputs
Observed legacy inputs and data paths:

- Palette-style JSON was normalized through legacy `normalizePaletteDocument()` / `validatePaletteDocument()` helpers.
- Built-in palettes were loaded from the engine global `palettesList`.
- Custom palettes were loaded from `localStorage` using `toolboxaid.paletteBrowser.customPalettes`.
- Hidden built-in palette ids were loaded from `localStorage` using `toolboxaid.paletteBrowser.hiddenBuiltins`.
- Shared palette handoff was read and written through `assetUsageIntegration.js`.
- Query/preset loading existed through `samplePresetPath` and diagnostics helpers.
- Workspace detection used hosted URL params, referrer/parent checks, and legacy shared state.
- Import/export/copy/edit actions accepted broader legacy palette document shapes.

The rebuilt Palette Manager accepts only session-backed `paletteJson` with the narrow conceptual shape:

```text
paletteJson.name
paletteJson.colors[]
```

A color entry is displayable only when it provides an explicit `#RRGGBB` or `#RRGGBBAA` color value. The rebuilt contract accepts explicit color strings and object entries with an explicit `hex` field because those are the explicit color forms observed in the legacy palette paths.

## UI Sections Found In Old Tool
Legacy UI sections found:

- Collapsible platform shell/header region.
- Left Palette List panel with launch context, search, count, and palette list.
- Center Palette Preview panel with title, swatches, palette name input, swatch color/name/symbol controls, palette actions, and swatch actions.
- Right Actions & Validation panel with JSON preview, validation text, import/export/copy/use-in-workspace controls, and handoff status text.

## Behavior To Keep Conceptually
Kept conceptually in the clean rebuild:

- Palette name display.
- Swatch rendering.
- Swatch count display.
- Explicit empty state when no session palette exists.
- Explicit malformed/error state when session palette data violates the contract.
- Read-only session/context visibility.
- Read-only validation visibility.

## Behavior To Delete
Deleted from the rebuilt active tool:

- `platformShell` usage.
- `assetUsageIntegration` usage.
- Shared handoff reads/writes.
- Built-in palette fallback loading.
- `localStorage` custom palette loading.
- Query-driven sample preset loading.
- Import/export/copy/edit/delete/new/duplicate palette workflows.
- Workspace Manager v1 wiring.
- Workspace auto-open behavior.
- `?tool=` launch behavior.
- Legacy broad schema normalization.
- Tool id alias dependencies.

## Legacy Systems Avoided
The rebuilt `toolbox/Palette Browser/` files and new `toolbox/common/` files do not import or call:

- `toolbox/shared/platformShell.js`
- `toolbox/shared/assetUsageIntegration.js`
- shared handoff modules
- Workspace Manager v1 files
- tool alias registries
- sample files
- game files

## Visible Rename
The legacy visible name was:

```text
Palette Browser / Manager
```

The rebuilt visible name is:

```text
Palette Manager
```

Applied to visible UI introduced/touched by this PR:

- document title
- top page header
- accordion summary
- menu ARIA labels
- menu readouts
- empty state
- malformed/error state
- validation/workspace readouts

The strings `Palette Browser / Manager`, `Palette Browser v2`, and `Palette Manager v2` do not appear in the rebuilt active UI files.

## Header Pattern From `/index.html`
Root `/index.html` uses a clean local page structure:

- `page-shell`
- `page-intro`
- `content-section`
- `card-grid`
- card-like hub links/readouts

Palette Manager reuses that pattern conceptually through the new Tool v2 common foundation:

- `tool-page-shell`
- `tool-page-intro`
- `tool-content-section`
- `tool-card-grid`
- `tool-panel`

The header/details area is wrapped in a local `<details>` / `<summary>` accordion styled in `toolbox/common/toolLayout.css`. It does not use `platformShell`, the old shared shell header, or legacy fullscreen header behavior.

## Final Rebuilt Palette Manager Contract
Palette Manager reads only session-backed `paletteJson`.

Supported data paths:

1. Workspace URL writes session and launches the tool with `hostContextId`; Palette Manager reads the matching session context.
2. Tool URL provides explicit `paletteJson` or `paletteData`; `toolbox/common/sessionContext.js` writes that explicit data to session first, then Palette Manager reads session.
3. Tool URL provides explicit `paletteUrl`; `toolbox/common/sessionContext.js` fetches that explicit URL, writes the result to session first, then Palette Manager reads session.

Minimum valid contract:

```text
paletteJson.name: non-empty display string
paletteJson.colors: array with one or more explicit color values
```

Malformed state text implemented:

```text
Palette session data is invalid. Expected paletteJson.name and paletteJson.colors[].
```

Empty state text implemented:

```text
No Palette Manager session data found. Open Palette Manager with a valid Tool v2 session context.
```

No fallback/default palette data exists.

## Sidebar Accordion Control Type Plan
Initial Palette-first control groups:

### Context
Implemented now:

- session found/missing state
- session source indicator
- host context id display when present

Deferred:

- multi-workspace switching
- external source browsing

### Palette
Implemented now:

- palette name
- swatch count
- swatch grid

Deferred:

- palette editing
- palette merging
- palette import/export

### Display
Implemented now:

- header/details accordion hide/show
- responsive swatch cards
- visible color name/hex/symbol display

Deferred:

- complex theme switching
- advanced layout presets
- display density controls

### Validation
Implemented now:

- empty state when no session palette exists
- malformed state when required fields are missing or invalid
- visible validation details

Deferred:

- full schema validation
- repo-wide validation reports

### Workspace
Implemented now:

- workspace/session context display only when present
- no Workspace Manager v1 wiring

Deferred:

- clean Tool v2 workspace selector integration
- workspace session update controls

## Files Created Or Rebuilt
- `toolbox/Palette Browser-v1/**` preserves the legacy implementation.
- `toolbox/Palette Browser/index.html` rebuilt Palette Manager shell.
- `toolbox/Palette Browser/main.js` class-based Palette Manager controller/renderers.
- `toolbox/Palette Browser/styles.css` Palette Manager local styling.
- `toolbox/common/toolLayout.css` Tool v2 layout/header accordion foundation.
- `toolbox/common/sessionContext.js` session-backed context reader/writer.
- `toolbox/common/toolContract.js` narrow Palette Manager contract validator.

## Validation Performed
Targeted validation run:

```powershell
node --check "toolbox/common/sessionContext.js"
node --check "toolbox/common/toolContract.js"
node --check "toolbox/Palette Browser/main.js"
```

Results:

- `node --check "toolbox/common/sessionContext.js"` passed.
- `node --check "toolbox/common/toolContract.js"` passed.
- `node --check "toolbox/Palette Browser/main.js"` passed.

Additional targeted inspection:

```powershell
rg -n "Palette Browser / Manager|Palette Browser v2|Palette Manager v2|platformShell|assetUsageIntegration|shared/|handoff|\?tool=" "toolbox/Palette Browser" "toolbox/common"
```

Result: no matches.

Protected-scope status check:

```powershell
git status --short -- schemas samples games start_of_day toolbox/shared "toolbox/Workspace Manager"
```

Result: no changes listed.

Smallest available targeted tool test: no existing automated Palette Manager / Palette Browser browser harness was found in scope, so no browser harness was run.

## Full Samples Smoke Decision
Full samples smoke skipped because this PR must not modify shared sample loader/framework behavior and must not modify samples/games.

## Roadmap Decision
`docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` was searched for exact Tool v2 / Palette Manager rebuild status items. Existing palette entries relate to older palette data completeness and manifest normalization work, not this Tool v2 Palette Manager rebuild. The roadmap was left untouched.
