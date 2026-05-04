# Preview Utilities Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `preview`
Source folder: `tools/preview`

## 1. Tool Purpose
Provide standalone preview-generation utility surfaces for tool assets and documentation previews.

## 2. Folder/Files Inspected
- `tools/preview/preview_svg_generator.html`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 3, inputs 10, selects 0, textareas 1, tables 0, inferred DOM controls/panels 1.
- `tools/preview/preview_svg_generator.html`: input[radio] #targetTypeSamples name=targetType - samples
- `tools/preview/preview_svg_generator.html`: input[radio] #targetTypeGames name=targetType - games
- `tools/preview/preview_svg_generator.html`: input[radio] #targetTypeTools name=targetType - tools
- `tools/preview/preview_svg_generator.html`: input[text] #baseUrl - http://127.0.0.1:5500
- `tools/preview/preview_svg_generator.html`: input[number] #waitMs - 3500
- `tools/preview/preview_svg_generator.html`: input[text] #assetFolder - assets/images
- `tools/preview/preview_svg_generator.html`: textarea #sampleList - Samples examples:
samples/phase-01/0102/index.html
samples/phase-13/1303/index.html
0107
...
- `tools/preview/preview_svg_generator.html`: input[checkbox] #forceRewrite - forceRewrite
- `tools/preview/preview_svg_generator.html`: input[checkbox] #onlyCaptureTimeout - onlyCaptureTimeout
- `tools/preview/preview_svg_generator.html`: input[radio] #captureModeFullScreen name=captureMode - fullscreen1600
- `tools/preview/preview_svg_generator.html`: input[radio] #captureModeCanvasOnly name=captureMode - canvasOnly
- `tools/preview/preview_svg_generator.html`: button #pickRepoBtn - Pick Repo Folder
- `tools/preview/preview_svg_generator.html`: button #executeBtn - Execute
- `tools/preview/preview_svg_generator.html`: button #stopBtn - Stop
- `tools/preview/preview_svg_generator.html`: panel #sampleList - inferred from JS DOM lookup
- Panels/surfaces: none found by class-name scan.

## 4. Current Component/Class/Function Inventory
- No classes, function declarations, arrow functions, or class-style methods were found in inspected JS/MJS files.

## 5. JSON Schema/Input Contract Currently Expected
Preview utility input is controlled by the local preview page fields; no publishable tool JSON contract is owned here.

JSON handling signals found: none in inspected files.

## 6. Valid JSON Behavior
Valid JSON is only accepted when a consuming tool or support script explicitly calls this folder. There is no standalone publish/import flow owned by this folder.

## 7. Invalid JSON Rejection Behavior
Invalid JSON is rejected by the consuming helper/script path. This folder should not silently repair or publish malformed tool payloads.

## 8. Tool-Owned JSON Responsibilities
- import/load: support-only; no standalone tool import flow unless a consuming script invokes it.
- validate: support-only validation helpers where present.
- edit/process: support modules may process values for callers; no workspace editing of internals.
- export/save: support-only unless a maintenance script writes its own artifact.
- publish to `tools.preview` if applicable: no standalone published output in this folder.
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
P29: Preview Utilities. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
