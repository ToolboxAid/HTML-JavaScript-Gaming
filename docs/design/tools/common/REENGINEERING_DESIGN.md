# Common Tool Contracts Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `common`
Source folder: `tools/common`

## 1. Tool Purpose
Provide small shared contract helpers and layout/session utilities consumed by tools.

## 2. Folder/Files Inspected
- `tools/common/sessionContext.js`
- `tools/common/toolContract.js`
- `tools/common/toolLayout.css`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 0, inputs 0, selects 0, textareas 0, tables 0, inferred DOM controls/panels 0.
- No buttons, inputs, selects, textareas, tables, or direct control lookups were found in the inspected files.
- Panels/surfaces: none found by class-name scan.

## 4. Current Component/Class/Function Inventory
- `tools/common/sessionContext.js`: function buildStorageKey; function createContextId; function extractPaletteJson; function fetchPaletteJsonFromUrl; function getLocationHref; function getSearchParams; function getSessionStorage; function normalizeContextRecord; function normalizeText; function parsePaletteJsonParam; function readSessionContextById; function readStoredContext; function resolvePaletteSessionFromLocation; function safeParseJson; function writePaletteSession
- `tools/common/toolContract.js`: function getExplicitColorValue; function isPlainObject; function normalizeColorEntry; function normalizeHexColor; function normalizeText; function validatePaletteContract

## 5. JSON Schema/Input Contract Currently Expected
No standalone JSON input contract. The folder exposes helper contracts such as palette validation and session context utilities.

JSON handling signals found: download/export, hostContextId, JSON.parse, JSON.stringify, safeParseJson, schema, sessionStorage, tools.*, validate.

## 6. Valid JSON Behavior
Valid JSON is only accepted when a consuming tool or support script explicitly calls this folder. There is no standalone publish/import flow owned by this folder.

## 7. Invalid JSON Rejection Behavior
Invalid JSON is rejected by the consuming helper/script path. This folder should not silently repair or publish malformed tool payloads.

## 8. Tool-Owned JSON Responsibilities
- import/load: support-only; no standalone tool import flow unless a consuming script invokes it.
- validate: support-only validation helpers where present.
- edit/process: support modules may process values for callers; no workspace editing of internals.
- export/save: support-only unless a maintenance script writes its own artifact.
- publish to `tools.common` if applicable: no standalone published output in this folder.
- copy/create toolState if applicable: no.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
No `tools.*` game/sample output is owned by this folder in the reset design. Consuming tools may use helpers from this folder, but persisted game/sample payloads must come from the owning launchable tool.

## 11. Playwright Expectations
No direct Playwright launch is expected for this global-only/support folder. Coverage should come through the launchable tool or guard that consumes it.

## 12. Manual Test Expectations
Manual verification should inspect the consuming workflow or maintenance script only; this folder has no direct user-facing tool flow.

## 13. Known Gaps
- Keep this folder support-only unless a future BUILD explicitly promotes a launchable/publishable contract.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P26: Common Tool Contracts. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
