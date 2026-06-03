# PR 11.34 - Vector Tool Comparison (Analysis Only)

## Scope
- Compared `vector-map-editor` and `vector-asset-studio` using current repo implementation files only.
- No implementation/runtime/schema/manifest changes were made for this PR.

## Files Reviewed
- `toolbox/toolRegistry.js`
- `toolbox/Vector Map Editor/index.html`
- `toolbox/Vector Map Editor/main.js`
- `toolbox/Vector Map Editor/editor/VectorMapEditorApp.js`
- `toolbox/Vector Map Editor/editor/VectorMapDocument.js`
- `toolbox/Vector Map Editor/editor/VectorMapSerializer.js`
- `toolbox/Vector Map Editor/editor/VectorMapRuntimeExporter.js`
- `toolbox/Vector Asset Studio/index.html`
- `toolbox/Vector Asset Studio/main.js`
- `toolbox/schemas/tools/vector-map-editor.schema.json`
- `toolbox/schemas/tools/vector-asset-studio.schema.json`
- `toolbox/schemas/workspace.manifest.schema.json`
- `samples/phase-09/0901/sample.0901.vector-map-editor.json`
- `samples/phase-09/0901/sample.0901.vector-asset-studio.json`
- `samples/phase-12/1204/sample.1204.vector-map-editor.json`
- `samples/phase-12/1204/sample.1204.vector-asset-studio.json`
- `samples/phase-19/1902/sample.1902.workspace-all-tools.json`
- `toolbox/shared/platformShell.js`
- `toolbox/Workspace Manager/main.js`
- `tests/tools/ToolLocalSampleMigration.test.mjs`
- `tests/tools/ToolBoundaryEnforcement.test.mjs`
- `tests/tools/ToolEntryLaunchContract.test.mjs`
- `tests/tools/ToolSchemaStrictModeValidation.test.mjs`

## Direct Answers
### 1) Do they do the same thing?
- No.
- `vector-map-editor` is map/spatial geometry editing with collision flags and map-runtime export.
- `vector-asset-studio` is SVG asset authoring/editing/export with palette-driven paint/stroke workflows.

### 2) What does each tool own today?
- `vector-map-editor` owns `vectorMapDocument` editing state and map object operations (points, object flags, object transform/rotation/center, collision-vector testing), plus editor/runtime JSON exports.
- `vector-asset-studio` owns `vectorAssetDocument` editing state and SVG element operations (shape creation, element selection/order/visibility, palette target paint/stroke/gradient, SVG serialization).

### 3) What data format does each tool read/write?
- `vector-map-editor`:
- Reads JSON preset payload containing `vectorMapDocument` (currently accepted from `payload`, `config`, or root during extraction).
- Imports `.json` files via file input.
- Writes `.editor.json` via `VectorMapSerializer`.
- Writes `.runtime.json` via `VectorMapRuntimeExporter`.
- `vector-asset-studio`:
- Reads JSON preset payload containing `vectorAssetDocument`.
- `vectorAssetDocument` can include inline `svgText` or `svgPath` fetched as SVG text.
- Imports `.svg` via file input.
- Writes `.svg` via `serializeCurrentSvg()` + download flow.
- Persists editor metadata as SVG attributes (`data-editor-*`) for palette/style restoration.

### 4) What user workflows does each tool support?
- `vector-map-editor` workflows:
- Build/edit 2D or 3D-wireframe map objects.
- Define map gameplay semantics via object flags (`collidable`, `deadly`, `trigger`, etc.).
- Inspect collision hits via collision vector tool.
- Manual JSON dock validate/apply/revert.
- Save authoring JSON and export runtime JSON.
- `vector-asset-studio` workflows:
- Draw/edit SVG shapes and paths.
- Apply palette-driven fill/stroke/gradient and stroke width.
- Select/reorder/hide/show elements.
- Canvas zoom/pan and selection overlays.
- Save canonical SVG output for downstream usage.

### 5) Are there duplicated functions or concepts?
- Yes, but mostly infrastructure-level duplication:
- Both support `samplePresetPath` query loading and diagnostics (`logToolLoad*` + `logToolUi*`).
- Both have selection state, enable/disable gating, and shared platform shell lifecycle patterns.
- Domain-level overlap exists only at a high level ("vector editing"), not in artifact ownership:
- Map editor edits structured map geometry documents.
- Asset studio edits SVG documents.

### 6) Which one should be canonical for SVG/vector asset authoring?
- `vector-asset-studio` should remain canonical.
- Evidence:
- Registry description explicitly says SVG asset authoring/export.
- Implementation contains SVG parser/sanitizer/serializer and SVG save/load controls.
- Sample payload uses `vectorAssetDocument` with `svgText/svgPath`.

### 7) Which one should be canonical for vector map/spatial/layout editing?
- `vector-map-editor` should remain canonical.
- Evidence:
- Registry description explicitly says map layout/collision authoring.
- Data model includes map object flags and spatial object schema.
- Runtime export path (`*.runtime.json`) is map-structured, not SVG-structured.

### 8) Should either tool be renamed, merged, retired, or kept separate?
- Recommendation: keep separate.
- Optional future naming polish only (not required): clarify that Vector Map Editor is map/collision-oriented to reduce user confusion with SVG editing.
- Merge/retire is not recommended right now because contracts, payloads, and workflows are materially different.

### 9) What would break if one was removed?
- If `vector-map-editor` were removed:
- Sample bindings and preset launch rows for map samples (for example 1212/1213/1214) would fail.
- Workspace sample 1902 tool manifest coverage and schema/test expectations would fail.
- Map authoring and runtime map export workflow would be lost.
- If `vector-asset-studio` were removed:
- Sample bindings and preset launch rows for vector asset samples (for example 1215/1216/1217) would fail.
- Any tool/game contracts expecting vector/SVG asset payload ownership from this tool would fail.
- Workspace sample 1902 full-tool coverage and related strict checks would fail.

### 10) What is the recommended next PR?
- Recommended next PR: contract-boundary hardening and clarity (docs + tests first, minimal code only if needed).
- Proposed scope:
- Document and enforce that `vector-map-editor` canonical input/output is `vectorMapDocument` + map runtime JSON.
- Document and enforce that `vector-asset-studio` canonical input/output is `vectorAssetDocument` + SVG.
- Add explicit no-cross-ownership assertions in tests (map tool should not become canonical SVG authoring path; asset studio should not become canonical collision/map runtime path).
- Keep shared shell/workspace integration untouched unless a specific defect is reproduced.

## Recommendation Summary
- Keep both tools.
- Keep `vector-asset-studio` as canonical SVG/vector-asset authoring tool.
- Keep `vector-map-editor` as canonical map/spatial/collision authoring tool.
- Avoid merge/retire now; focus next on boundary clarity and contract tests.
