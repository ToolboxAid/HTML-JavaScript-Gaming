# palette-manager-v2 Reengineering Design

Task: PR_26124_024
Classification: transitional/quarantine tool
Core priority: deferred
Source folder: `tools/palette-manager-v2`
Publish target: `reference-only shape under tools.palette-manager-v2`

## Tool Purpose
Reference-only quarantine folder for current palette-manager-v2 behavior. It is not a core rebuild anchor and does not replace Palette Browser.

## Folder/Files Inspected
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/index.js`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/palette-manager-v2/index.html`: `button[button]#paletteManagerBackButton` - Back | Triggers the current transitional palette manager payload UI action for `Back`. | May update draft transitional palette manager payload data; tools.palette-manager-v2 publish must wait for validation. |
| `tools/palette-manager-v2/index.html`: `button[button]#paletteManagerOpenVectorMapEditorV2Button` - Open in Vector Map Editor V2 | Starts transitional palette manager payload import/load. | Reads incoming JSON into the tool-owned transitional palette manager payload only after validation succeeds. |

## Panels And Surfaces Found
- `tools/palette-manager-v2/index.html`: `.hub-page-home--viewport`
- `tools/palette-manager-v2/index.html`: `.page-shell`
- `tools/palette-manager-v2/index.html`: `.palette-manager-v2-grid`
- `tools/palette-manager-v2/index.html`: `.palette-manager-v2-panel`

## Current Component/Class/Function Inventory
- `tools/palette-manager-v2/index.js`: PaletteManagerV2; buildRuntimeSnapshot; buildToolUrl; goBack; handleNavigationState; handleSessionVersion; loadContract; logStructuredError; openVectorMapEditorV2; optionalUrlStateSummary; readSession; readUrlState; registerSnapshotHook; renderError; renderMissing; renderNavigation; renderPalette; toolLabel

## Target Controls
Keep:
- current visible controls only as reference for later cleanup

Remove or rename:
- do not carry this folder into the core rebuild lane

Add:
- no core rebuild controls in this PR

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for transitional palette manager payload. No core schema contract is assigned to this transitional/reference folder.
Required keys: none assigned for this reference folder.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: treat transitional palette manager payload behavior as reference-only evidence from this exact folder
- validate: do not assign a core schema contract to palette-manager-v2 in this PR
- edit/process: do not define new rebuild-owned JSON fields from palette-manager-v2
- export/save: no core export/save contract is assigned to tools.palette-manager-v2
- publish: tools.palette-manager-v2 remains a reference-only null published-output shape
- copy/create payload: no core payload copy/create behavior is assigned until a later cleanup PR

## Valid JSON Behavior
- accepted only as the current transitional reference behavior found in this exact folder

## Invalid JSON Rejection Behavior
- any attempt to use this folder as the core rebuild contract
- any behavior that conflicts with the rebuilt core tool contract when cleanup occurs later

## Published Output
Published Output:
```jsonc
tools.palette-manager-v2 = {
  "publishedOutput": null,
  "status": "transitional-reference-only"
}
```

## Playwright Expectations
- load tools/palette-manager-v2/index.html only if later cleanup needs a reference screenshot
- do not use this folder for core publish-contract verification

## Manual Test Expectations
- Inspect tools/palette-manager-v2 only as a deferred reference surface.
- Do not rebuild from this folder unless a later cleanup PR explicitly scopes it.

## Known Gaps
- Deferred cleanup after core tool contracts are rebuilt and stable.

## Rebuild Order Priority
Deferred transitional/reference cleanup. Do not place this folder in the core rebuild lane.
