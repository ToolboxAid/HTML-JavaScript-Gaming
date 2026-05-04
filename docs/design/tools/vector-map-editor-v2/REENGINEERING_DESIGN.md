# Vector Map Editor V2 Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `vector-map-editor-v2`
Source folder: `tools/vector-map-editor-v2`

## 1. Tool Purpose
Read hosted vector map documents, validate `payloadJson.vectorMapDocument`, and render map previews from session JSON.

## 2. Folder/Files Inspected
- `tools/vector-map-editor-v2/index.html`
- `tools/vector-map-editor-v2/index.js`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 1, inputs 0, selects 0, textareas 0, tables 0, inferred DOM controls/panels 10.
- `tools/vector-map-editor-v2/index.html`: button[button] #vectorMapV2BackButton - Back
- `tools/vector-map-editor-v2/index.js`: button #vectorMapV2BackButton - inferred from JS DOM lookup
- `tools/vector-map-editor-v2/index.js`: panel #vectorMapV2SessionReadout - inferred from JS DOM lookup
- `tools/vector-map-editor-v2/index.js`: panel #vectorMapV2ContractReadout - inferred from JS DOM lookup
- `tools/vector-map-editor-v2/index.js`: panel #vectorMapV2WorkspaceReadout - inferred from JS DOM lookup
- `tools/vector-map-editor-v2/index.js`: panel #vectorMapV2State - inferred from JS DOM lookup
- `tools/vector-map-editor-v2/index.js`: panel #vectorMapV2EmptyState - inferred from JS DOM lookup
- `tools/vector-map-editor-v2/index.js`: panel #vectorMapV2InvalidState - inferred from JS DOM lookup
- `tools/vector-map-editor-v2/index.js`: panel #vectorMapV2ValidState - inferred from JS DOM lookup
- `tools/vector-map-editor-v2/index.js`: panel #vectorMapV2ObjectList - inferred from JS DOM lookup
- `tools/vector-map-editor-v2/index.js`: panel #vectorMapV2Stage - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/vector-map-editor-v2/index.html`: .page-shell
  - `tools/vector-map-editor-v2/index.html`: .vector-map-v2-grid
  - `tools/vector-map-editor-v2/index.html`: .vector-map-v2-panel
  - `tools/vector-map-editor-v2/index.html`: .vector-map-v2-object-list
  - `tools/vector-map-editor-v2/index.html`: .vector-map-v2-stage

## 4. Current Component/Class/Function Inventory
- `tools/vector-map-editor-v2/index.js`: class VectorMapEditorV2; method buildRuntimeSnapshot; method buildToolUrl; method goBack; method handleNavigationState; method handleSessionVersion; method loadContract; method logStructuredError; method optionalUrlStateSummary; method readSession; method readUrlState; method registerSnapshotHook; method renderError; method renderMissing; method renderNavigation; method renderVectorMap; method toolLabel

## 5. JSON Schema/Input Contract Currently Expected
Hosted session context: `version: "v2"`, `toolId: "vector-map-editor-v2"`, and `payloadJson.vectorMapDocument`. The vector map needs non-empty `name`, positive numeric `width`/`height`, non-empty `background`, and `objects[]`. Each object needs `name`, `kind`, `style.stroke`, positive `style.lineWidth`, and `points[]`; closed objects require `style.fill`.

JSON handling signals found: hostContextId, JSON.parse, sessionStorage.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the hosted session or workspace manifest contract, stay under the current size limits where enforced, and render or persist only after the tool-owned validation path succeeds.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing session data, wrong `toolId`, unsupported keys, wrong nested payload shape, and oversized payloads must produce an error state and block workspace writes or launches.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.vector-map-editor-v2` if applicable: yes, publish normalized output under `tools.vector-map-editor-v2` when this tool is the producer.
- copy/create toolState if applicable: yes where applicable: copy/create hosted `toolState` payloads using `version`, `toolId`, and `payloadJson` only.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.vector-map-editor-v2`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/vector-map-editor-v2/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/vector-map-editor-v2/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Dedicated schema alignment is still needed for this folder-level contract.
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P15: Vector Map Editor V2. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
