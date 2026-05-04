# Asset Manager V2 Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `asset-manager-v2`
Source folder: `tools/asset-manager-v2`

## 1. Tool Purpose
Read and edit hosted asset catalog session data, validate `payloadJson.assetCatalog`, and persist valid catalog edits back to the host context.

## 2. Folder/Files Inspected
- `tools/asset-manager-v2/index.html`
- `tools/asset-manager-v2/index.js`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 3, inputs 4, selects 0, textareas 0, tables 0, inferred DOM controls/panels 12.
- `tools/asset-manager-v2/index.html`: button[button] #assetBrowserV2BackButton - Back
- `tools/asset-manager-v2/index.html`: button[button] #assetBrowserV2OpenSvgAssetStudioV2Button - Open in SVG Asset Studio V2
- `tools/asset-manager-v2/index.html`: input[text] #assetManagerV2AddId - assetManagerV2AddId
- `tools/asset-manager-v2/index.html`: input[text] #assetManagerV2AddLabel - assetManagerV2AddLabel
- `tools/asset-manager-v2/index.html`: input[text] #assetManagerV2AddKind - assetManagerV2AddKind
- `tools/asset-manager-v2/index.html`: input[text] #assetManagerV2AddPath - assetManagerV2AddPath
- `tools/asset-manager-v2/index.html`: button[button] #assetManagerV2AddButton - Add Asset
- `tools/asset-manager-v2/index.js`: button #assetBrowserV2BackButton - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: button #assetBrowserV2OpenSvgAssetStudioV2Button - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: button #assetManagerV2AddButton - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: panel #assetManagerV2ActionStatus - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: panel #assetBrowserV2SessionReadout - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: panel #assetBrowserV2ContractReadout - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: panel #assetBrowserV2WorkspaceReadout - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: panel #assetBrowserV2State - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: panel #assetBrowserV2EmptyState - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: panel #assetBrowserV2InvalidState - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: panel #assetBrowserV2ValidState - inferred from JS DOM lookup
- `tools/asset-manager-v2/index.js`: panel #assetBrowserV2List - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/asset-manager-v2/index.html`: .page-shell
  - `tools/asset-manager-v2/index.html`: .asset-manager-v2-grid
  - `tools/asset-manager-v2/index.html`: .asset-manager-v2-panel

## 4. Current Component/Class/Function Inventory
- `tools/asset-manager-v2/index.js`: class AssetBrowserV2; method addAssetEntry; method buildRuntimeSnapshot; method buildToolUrl; method clearAddAssetForm; method clearSelectedAssetDetails; method cloneSessionValue; method goBack; method handleNavigationState; method handleSessionVersion; method loadContract; method logStructuredError; method normalizedAssetEntryFromForm; method openSvgAssetStudioV2; method optionalUrlStateSummary; method persistValidSessionForWorkspace; method readSession; method readUrlState; method registerSnapshotHook; method removeAssetEntryById; method renderCatalog; method renderError; method renderMissing; method renderNavigation; method renderSelectedAssetDetails; method selectedAssetEntryFromCatalogEntries; method setActionStatus; method toolLabel

## 5. JSON Schema/Input Contract Currently Expected
Hosted session context: `version: "v2"`, `toolId: "asset-manager-v2"`, and `payloadJson.assetCatalog`. `assetCatalog.name` must be a non-empty string. `assetCatalog.entries` must be an array of objects with non-empty `id`, `label`, `kind`, and `path`. The folder rejects `paletteJson` and `payloadJson.importName`/`payloadJson.importDestination`.

JSON handling signals found: download/export, hostContextId, JSON.parse, JSON.stringify, sessionStorage.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the hosted session or workspace manifest contract, stay under the current size limits where enforced, and render or persist only after the tool-owned validation path succeeds.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing session data, wrong `toolId`, unsupported keys, wrong nested payload shape, and oversized payloads must produce an error state and block workspace writes or launches.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.asset-manager-v2` if applicable: yes, publish normalized output under `tools.asset-manager-v2` when this tool is the producer.
- copy/create toolState if applicable: yes where applicable: copy/create hosted `toolState` payloads using `version`, `toolId`, and `payloadJson` only.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.asset-manager-v2`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/asset-manager-v2/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/asset-manager-v2/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Dedicated schema alignment is still needed for this folder-level contract.
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P05: Asset Manager V2. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
