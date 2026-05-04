# Palette Manager V2 Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `palette-manager-v2`
Source folder: `tools/palette-manager-v2`

## 1. Tool Purpose
Read a hosted palette document from session state, validate `payloadJson.paletteDocument`, and display the active palette without workspace-owned JSON internals.

## 2. Folder/Files Inspected
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/index.js`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 2, inputs 0, selects 0, textareas 0, tables 0, inferred DOM controls/panels 9.
- `tools/palette-manager-v2/index.html`: button[button] #paletteManagerBackButton - Back
- `tools/palette-manager-v2/index.html`: button[button] #paletteManagerOpenVectorMapEditorV2Button - Open in Vector Map Editor V2
- `tools/palette-manager-v2/index.js`: button #paletteManagerBackButton - inferred from JS DOM lookup
- `tools/palette-manager-v2/index.js`: button #paletteManagerOpenVectorMapEditorV2Button - inferred from JS DOM lookup
- `tools/palette-manager-v2/index.js`: panel #paletteManagerSessionReadout - inferred from JS DOM lookup
- `tools/palette-manager-v2/index.js`: panel #paletteManagerContractReadout - inferred from JS DOM lookup
- `tools/palette-manager-v2/index.js`: panel #paletteManagerWorkspaceReadout - inferred from JS DOM lookup
- `tools/palette-manager-v2/index.js`: panel #paletteManagerState - inferred from JS DOM lookup
- `tools/palette-manager-v2/index.js`: panel #paletteManagerEmptyState - inferred from JS DOM lookup
- `tools/palette-manager-v2/index.js`: panel #paletteManagerInvalidState - inferred from JS DOM lookup
- `tools/palette-manager-v2/index.js`: panel #paletteManagerValidState - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/palette-manager-v2/index.html`: .page-shell
  - `tools/palette-manager-v2/index.html`: .palette-manager-v2-grid
  - `tools/palette-manager-v2/index.html`: .palette-manager-v2-panel

## 4. Current Component/Class/Function Inventory
- `tools/palette-manager-v2/index.js`: class PaletteManagerV2; method buildRuntimeSnapshot; method buildToolUrl; method goBack; method handleNavigationState; method handleSessionVersion; method loadContract; method logStructuredError; method openVectorMapEditorV2; method optionalUrlStateSummary; method readSession; method readUrlState; method registerSnapshotHook; method renderError; method renderMissing; method renderNavigation; method renderPalette; method toolLabel

## 5. JSON Schema/Input Contract Currently Expected
Hosted session context: `version: "v2"`, `toolId: "palette-manager-v2"`, and `payloadJson.paletteDocument`. `paletteDocument.name` must be a non-empty string. `paletteDocument.swatches` must be an array of objects with `symbol` as one character, `name` as a non-empty string, and `hex` as `#RRGGBB` or `#RRGGBBAA`. The folder rejects `paletteJson`, `payloadJson.assetCatalog`, and `paletteDocument.colors`.

JSON handling signals found: hostContextId, JSON.parse, sessionStorage, validate.

## 6. Valid JSON Behavior
Valid JSON is only accepted when a consuming tool or support script explicitly calls this folder. There is no standalone publish/import flow owned by this folder.

## 7. Invalid JSON Rejection Behavior
Invalid JSON is rejected by the consuming helper/script path. This folder should not silently repair or publish malformed tool payloads.

## 8. Tool-Owned JSON Responsibilities
- import/load: support-only; no standalone tool import flow unless a consuming script invokes it.
- validate: support-only validation helpers where present.
- edit/process: support modules may process values for callers; no workspace editing of internals.
- export/save: support-only unless a maintenance script writes its own artifact.
- publish to `tools.palette-manager-v2` if applicable: no standalone published output in this folder.
- copy/create toolState if applicable: yes where applicable: copy/create hosted `toolState` payloads using `version`, `toolId`, and `payloadJson` only.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
No `tools.*` game/sample output is owned by this folder in the reset design. Consuming tools may use helpers from this folder, but persisted game/sample payloads must come from the owning launchable tool.

## 11. Playwright Expectations
Open `tools/palette-manager-v2/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/palette-manager-v2/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Dedicated schema alignment is still needed for this folder-level contract.
- Keep this folder support-only unless a future BUILD explicitly promotes a launchable/publishable contract.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P02: Palette Manager V2. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
