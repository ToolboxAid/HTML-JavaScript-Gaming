# vector-map-editor-v2 Reengineering Design

Task: PR_26124_024
Classification: transitional/quarantine tool
Core priority: deferred
Source folder: `tools/vector-map-editor-v2`
Publish target: `reference-only shape under tools.vector-map-editor-v2`

## Tool Purpose
Reference-only quarantine folder for current vector-map-editor-v2 behavior. It is not a core rebuild anchor and does not replace Vector Map Editor.

## Folder/Files Inspected
- `tools/vector-map-editor-v2/index.html`
- `tools/vector-map-editor-v2/index.js`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/vector-map-editor-v2/index.html`: `button[button]#vectorMapV2BackButton` - Back | Triggers the current transitional vector map editor payload UI action for `Back`. | May update draft transitional vector map editor payload data; tools.vector-map-editor-v2 publish must wait for validation. |

## Panels And Surfaces Found
- `tools/vector-map-editor-v2/index.html`: `.hub-page-home--viewport`
- `tools/vector-map-editor-v2/index.html`: `.page-shell`
- `tools/vector-map-editor-v2/index.html`: `.vector-map-v2-grid`
- `tools/vector-map-editor-v2/index.html`: `.vector-map-v2-object-list`
- `tools/vector-map-editor-v2/index.html`: `.vector-map-v2-panel`
- `tools/vector-map-editor-v2/index.html`: `.vector-map-v2-stage`

## Current Component/Class/Function Inventory
- `tools/vector-map-editor-v2/index.js`: VectorMapEditorV2; buildRuntimeSnapshot; buildToolUrl; goBack; handleNavigationState; handleSessionVersion; loadContract; logStructuredError; optionalUrlStateSummary; readSession; readUrlState; registerSnapshotHook; renderError; renderMissing; renderNavigation; renderVectorMap; toolLabel

## Target Controls
Keep:
- current visible controls only as reference for later cleanup

Remove or rename:
- do not carry this folder into the core rebuild lane

Add:
- no core rebuild controls in this PR

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for transitional vector map editor payload. No core schema contract is assigned to this transitional/reference folder.
Required keys: none assigned for this reference folder.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: treat transitional vector map editor payload behavior as reference-only evidence from this exact folder
- validate: do not assign a core schema contract to vector-map-editor-v2 in this PR
- edit/process: do not define new rebuild-owned JSON fields from vector-map-editor-v2
- export/save: no core export/save contract is assigned to tools.vector-map-editor-v2
- publish: tools.vector-map-editor-v2 remains a reference-only null published-output shape
- copy/create payload: no core payload copy/create behavior is assigned until a later cleanup PR

## Valid JSON Behavior
- accepted only as the current transitional reference behavior found in this exact folder

## Invalid JSON Rejection Behavior
- any attempt to use this folder as the core rebuild contract
- any behavior that conflicts with the rebuilt core tool contract when cleanup occurs later

## Published Output
Published Output:
```jsonc
tools.vector-map-editor-v2 = {
  "publishedOutput": null,
  "status": "transitional-reference-only"
}
```

## Playwright Expectations
- load tools/vector-map-editor-v2/index.html only if later cleanup needs a reference screenshot
- do not use this folder for core publish-contract verification

## Manual Test Expectations
- Inspect tools/vector-map-editor-v2 only as a deferred reference surface.
- Do not rebuild from this folder unless a later cleanup PR explicitly scopes it.

## Known Gaps
- Deferred cleanup after core tool contracts are rebuilt and stable.

## Rebuild Order Priority
Deferred transitional/reference cleanup. Do not place this folder in the core rebuild lane.
