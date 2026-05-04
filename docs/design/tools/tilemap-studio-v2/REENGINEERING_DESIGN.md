# tilemap-studio-v2 Reengineering Design

Task: PR_26124_024
Classification: transitional/quarantine tool
Core priority: deferred
Source folder: `tools/tilemap-studio-v2`
Publish target: `reference-only shape under tools.tilemap-studio-v2`

## Tool Purpose
Reference-only quarantine folder for current tilemap-studio-v2 behavior. It is not a core rebuild anchor and does not replace Tilemap Studio.

## Folder/Files Inspected
- `tools/tilemap-studio-v2/index.html`
- `tools/tilemap-studio-v2/index.js`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/tilemap-studio-v2/index.html`: `button[button]#tilemapV2BackButton` - Back | Triggers the current transitional tilemap studio payload UI action for `Back`. | May update draft transitional tilemap studio payload data; tools.tilemap-studio-v2 publish must wait for validation. |
| `tools/tilemap-studio-v2/index.html`: `button[button]#tilemapV2OpenAssetBrowserV2Button` - Open in Asset Browser V2 | Starts transitional tilemap studio payload import/load. | Reads incoming JSON into the tool-owned transitional tilemap studio payload only after validation succeeds. |

## Panels And Surfaces Found
- `tools/tilemap-studio-v2/index.html`: `.hub-page-home--viewport`
- `tools/tilemap-studio-v2/index.html`: `.page-shell`
- `tools/tilemap-studio-v2/index.html`: `.tilemap-v2-grid`
- `tools/tilemap-studio-v2/index.html`: `.tilemap-v2-panel`

## Current Component/Class/Function Inventory
- `tools/tilemap-studio-v2/index.js`: TilemapStudioV2; buildRuntimeSnapshot; buildToolUrl; goBack; handleNavigationState; handleSessionVersion; loadContract; logStructuredError; openAssetBrowserV2; optionalUrlStateSummary; readSession; readUrlState; registerSnapshotHook; renderError; renderMissing; renderNavigation; renderTilemap; toolLabel

## Target Controls
Keep:
- current visible controls only as reference for later cleanup

Remove or rename:
- do not carry this folder into the core rebuild lane

Add:
- no core rebuild controls in this PR

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for transitional tilemap studio payload. No core schema contract is assigned to this transitional/reference folder.
Required keys: none assigned for this reference folder.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: treat transitional tilemap studio payload behavior as reference-only evidence from this exact folder
- validate: do not assign a core schema contract to tilemap-studio-v2 in this PR
- edit/process: do not define new rebuild-owned JSON fields from tilemap-studio-v2
- export/save: no core export/save contract is assigned to tools.tilemap-studio-v2
- publish: tools.tilemap-studio-v2 remains a reference-only null published-output shape
- copy/create payload: no core payload copy/create behavior is assigned until a later cleanup PR

## Valid JSON Behavior
- accepted only as the current transitional reference behavior found in this exact folder

## Invalid JSON Rejection Behavior
- any attempt to use this folder as the core rebuild contract
- any behavior that conflicts with the rebuilt core tool contract when cleanup occurs later

## Published Output
Published Output:
```jsonc
tools.tilemap-studio-v2 = {
  "publishedOutput": null,
  "status": "transitional-reference-only"
}
```

## Playwright Expectations
- load tools/tilemap-studio-v2/index.html only if later cleanup needs a reference screenshot
- do not use this folder for core publish-contract verification

## Manual Test Expectations
- Inspect tools/tilemap-studio-v2 only as a deferred reference surface.
- Do not rebuild from this folder unless a later cleanup PR explicitly scopes it.

## Known Gaps
- Deferred cleanup after core tool contracts are rebuilt and stable.

## Rebuild Order Priority
Deferred transitional/reference cleanup. Do not place this folder in the core rebuild lane.
