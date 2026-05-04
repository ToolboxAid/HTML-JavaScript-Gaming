# palette-manager-v2 Reengineering Design

Task: PR_26124_026

Source folder: `tools/palette-manager-v2`
Runtime tool id: `palette-manager-v2`
Global data key: `tools.palette-browser`
Publish target: `tools.palette-browser`

## Tool Purpose
Palette Manager V2 owns global palette editing for `tools.palette-browser.swatches`. It has user-owned swatches plus browse-only source palettes (`crayola`, `w3c`, `javascript`) that can be pinned into the user palette.

## Folder/Files Inspected
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/main.js`
- `tools/palette-manager-v2/paletteManagerV2.css`
- `tools/palette-manager-v2/README.md`
- `tools/palette-manager-v2/how_to_use.html`

## Current Controls
| Control | Action | JSON effect |
|---|---|---|
| `select#sourcePaletteSelect` | Chooses `crayola`, `w3c`, or `javascript` source list. | No JSON change; only changes browse source. |
| `input#sourceSearchInput[type=search]` | Filters visible source swatches by symbol, hex, or name. | No JSON change. |
| `input#swatchSymbolInput[type=text]` | Edits the draft user swatch symbol. | Sets `symbol` for add/update after validation. |
| `input#swatchHexInput[type=text]` | Edits the draft user swatch hex. | Sets `hex` after `#RRGGBB` validation. |
| `input#swatchNameInput[type=text]` | Edits the draft user swatch name. | Sets `name` for add/update after validation. |
| `input#swatchSourceInput[type=text]` | Edits the draft user swatch source. | Sets `source` for add/update after validation. |
| `button#addSwatchButton` | Adds the form swatch to the user palette. | Appends to `tools.palette-browser.swatches` when valid. |
| `button#updateSwatchButton` | Updates the selected user swatch from the form. | Replaces the selected swatch when valid. |
| `button#removeSwatchButton` | Removes the selected user swatch. | Deletes the selected swatch unless `isSwatchUsedByTool(swatch)` returns true. |
| `button#clearFormButton` | Clears the editor form and selection. | No JSON change. |
| source row tack button | Pins or unpins a source swatch. | Red tack appends a cloned source swatch; green tack removes the matching user swatch unless blocked by usage. |
| user row tack button | Removes a user swatch. | Deletes that swatch unless blocked by usage. |
| `button#importPaletteButton` + `input#importPaletteInput[type=file]` | Imports JSON from disk. | Replaces `tools.palette-browser.swatches` only after JSON and swatches validate. |
| `button#copyPaletteButton` | Copies the export wrapper. | No state change; copies `{ tools: { "palette-browser": { swatches } } }`. |
| `button#exportPaletteButton` | Downloads the export wrapper. | No state change; exports `{ tools: { "palette-browser": { swatches } } }`. |

## Component/Class/Function Inventory
- CSS/layout classes: `.palette-manager-v2`, `.palette-manager-v2__layout`, `.palette-manager-v2__panel`, `.palette-manager-v2__accordion`, `.palette-manager-v2__form-grid`, `.palette-manager-v2__controls`, `.palette-manager-v2__list`, `.palette-manager-v2__swatch-row`, `.palette-manager-v2__pin-button`, `.palette-manager-v2__json-preview`, `.palette-manager-v2__errors`.
- Shared layout hooks: `#shared-theme-header`, `.tools-platform-layout-grid`, `.tools-platform-resize-panel`, `data-panel-side="left"`, `data-panel-side="right"`.
- Functions in `main.js`: `sanitizeText`, `normalizeHex`, `swatchKey`, `cloneSwatch`, `isSwatchUsedByTool`, `validateSwatch`, `validateUserSwatches`, `buildGlobalPaletteValue`, `buildExportDocument`, `setErrors`, `setStatus`, `renderErrors`, `renderJsonPreview`, `renderSelectedSwatchPreview`, `setFormFromSwatch`, `clearForm`, `readFormSwatch`, `findUserSwatchIndex`, `getVisibleSourceSwatches`, `createSwatchRow`, `renderUserSwatches`, `renderSourceSwatches`, `renderValidation`, `render`, `addUserSwatch`, `updateSelectedSwatch`, `removeUserSwatch`, `removeSelectedSwatch`, `pinSourceSwatch`, `extractImportedPaletteDocument`, `importPaletteJsonFromFile`, `exportPaletteJson`, `copyPaletteJson`, `bindEvents`, `init`.
- Global API: `window.paletteManagerV2App = { getPaletteValue, getExportDocument, isSwatchUsedByTool }`.

## JSON Contract
Owned swatch shape:

```json
{
  "symbol": "R",
  "hex": "#ED0A3F",
  "name": "Red",
  "source": "crayola"
}
```

Required fields: `symbol`, `hex`, `name`, `source`.
`hex` must match `#RRGGBB`.

Published Output:
```js
tools.palette-browser = {
  swatches: [
    {
      symbol: "R",
      hex: "#ED0A3F",
      name: "Red",
      source: "crayola"
    }
  ]
}
```

Export/copy wrapper:

```js
{
  tools: {
    "palette-browser": {
      swatches: []
    }
  }
}
```

## Valid JSON Behavior
- Import accepts a JSON object with `tools.palette-browser.swatches`.
- Every imported swatch must include `symbol`, `hex`, `name`, and `source`.
- Valid import replaces the current user swatches and rerenders the user list, source pin states, preview JSON, and validation viewer.

## Invalid JSON Rejection Behavior
- Parse failures are rejected before any state change.
- Missing `tools`, missing `tools.palette-browser`, non-array `swatches`, missing fields, and invalid hex values are rejected before render/update of imported data.
- Add/update/export/copy are blocked while the affected swatch or swatch list is invalid.

## Tool-Owned JSON Responsibilities
- import/load: read selected JSON file, parse, require `tools.palette-browser.swatches`, validate every swatch, then replace user swatches.
- validate: enforce `symbol`, `hex`, `name`, `source`; enforce `#RRGGBB`.
- edit/process: add, update, remove, filter, and pin/unpin swatches inside the tool.
- export/save: emit the wrapper with the unchanged global data key.
- publish: `tools.palette-browser` only.

## Workspace Integration Contract
Tool receives validated payload and owns behavior. The global data key remains `tools.palette-browser`; the runtime id and launch route are `palette-manager-v2`.

## Published tools.* Output Contract For Games/Samples
Games and samples consume the global palette at `tools.palette-browser.swatches`. They do not consume a `tools.palette-manager-v2` key.

## Playwright Expectations
No workspace-v2 Playwright gate remains for this tool. Future Playwright coverage should launch `tools/palette-manager-v2/index.html`, add a user swatch, pin and unpin a source swatch, reject invalid import JSON, and assert copied/exported JSON uses `tools.palette-browser`.

## Manual Test Expectations
- Open `tools/palette-manager-v2/index.html` without console errors.
- Add a user swatch with `symbol`, `hex`, `name`, `source`; confirm it appears in preview JSON.
- Browse `crayola`, `w3c`, and `javascript`; confirm red tack pins and green tack unpins.
- Confirm unpin calls `isSwatchUsedByTool(swatch)` and blocks if the stub is changed to return true.
- Import invalid JSON and confirm the current swatches do not change.
- Export/copy and confirm only `tools.palette-browser.swatches` is emitted.

## Known Gaps
- `isSwatchUsedByTool(swatch)` is a stub and does not scan repo data.
- Source palettes are intentionally small browse-only seed lists.
- Schema alignment for required `source` and `#RRGGBB` remains deferred to a schema-scoped PR.

## Rebuild Order Priority
Core-01. This is the palette-first rebuild anchor.
