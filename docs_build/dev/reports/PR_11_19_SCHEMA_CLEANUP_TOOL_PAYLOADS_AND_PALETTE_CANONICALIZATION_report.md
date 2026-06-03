# PR_11_19_SCHEMA_CLEANUP_TOOL_PAYLOADS_AND_PALETTE_CANONICALIZATION Report

## Result
- PASS

## Palette Schema Canonicalization

### Palette schema files found (pre-change)
- `tools/schemas/palette.schema.json`
- `tools/schemas/tools/palette.schema.json`
- `tools/schemas/tools/palette-browser.schema.json`

### Palette schema files deleted
- `tools/schemas/palette.schema.json`
- `tools/schemas/tools/palette.schema.json`

### Final canonical palette schema path
- `tools/schemas/tools/palette-browser.schema.json`

### Canonical palette schema contract
- strict root with `additionalProperties: false`
- required: `tool`, `version`, `payload`
- `tool` const: `palette-browser`
- `payload` strict object with required `schema`, `version`, `name`, `swatches`
- `swatches[].symbol|hex|name` explicit and strict
- no object schema uses `additionalProperties: true`

## Tool Payload Schema Cleanup

### `sample.tool-payload.schema.json` handling
- Kept file path but demoted/narrowed its role to **sample wrapper only**.
- Added explicit description that runtime tool payloads must validate against `tools/schemas/tools/*.schema.json`.
- Added strict guard (`not` requiring `tool` + `payload`) so it cannot be used as tool payload schema.
- Kept strict mode (`additionalProperties: false`) while allowing sample wrapper document keys via `patternProperties` + strict JSON value defs.

### `config` replacement choice
- Chosen field: `payload`
- Applied consistently across tool schemas and sample 1902 tool entries.

### generic `gameId` replacement choice
- Chosen generic field: `projectId`
- Replaced generic schema-level usage in `tools/schemas/tools/skin-editor.schema.json` (root field now `projectId`).
- Updated sample 1902 generic payload usage:
  - `tools.skin-editor.projectId`
  - `tools.asset-pipeline-tool.payload.pipelinePayload.projectId`
- Kept game-specific `gameId` only inside game-specific skin document section (`games.pong.skin/1`) in sample 1902.

## Workspace `$ref` Integration
- Updated workspace manifest palette ref:
  - `tools/schemas/workspace.manifest.schema.json`
  - `tools.properties.palette -> $ref: ./tools/palette-browser.schema.json`
- `tools.additionalProperties` remains `false`.
- tool refs remain explicit by tool id.

## Schemas Updated
- `tools/schemas/workspace.manifest.schema.json`
- `tools/schemas/sample.tool-payload.schema.json`
- `tools/schemas/tools/3d-asset-viewer.schema.json`
- `tools/schemas/tools/3d-camera-path-editor.schema.json`
- `tools/schemas/tools/3d-json-payload.schema.json`
- `tools/schemas/tools/asset-browser.schema.json`
- `tools/schemas/tools/asset-pipeline.schema.json`
- `tools/schemas/tools/palette-browser.schema.json`
- `tools/schemas/tools/parallax-editor.schema.json`
- `tools/schemas/tools/performance-profiler.schema.json`
- `tools/schemas/tools/physics-sandbox.schema.json`
- `tools/schemas/tools/replay-visualizer.schema.json`
- `tools/schemas/tools/skin-editor.schema.json`
- `tools/schemas/tools/sprite-editor.schema.json`
- `tools/schemas/tools/state-inspector.schema.json`
- `tools/schemas/tools/tile-map-editor.schema.json`
- `tools/schemas/tools/tile-model-converter.schema.json`
- `tools/schemas/tools/vector-asset-studio.schema.json`
- `tools/schemas/tools/vector-map-editor.schema.json`

## Sample 1902 Validation/Rebuild
- Updated only:
  - `samples/phase-19/1902/sample.1902.workspace-all-tools.json`
- Changes include:
  - tool entry `config` -> `payload`
  - `tools.palette-browser` migrated to canonical palette-browser payload shape
  - `tools.palette-browser` given explicit strict payload
  - generic `projectId` replacements
  - removed nested tile payload `$schema` reference to `sample.tool-payload.schema.json`

## Unknown Field Rejection Result
- Test injects `root.tools.asset-browser.payload.__unknown = true`.
- Validation rejects injection (PASS).

## Validation Commands and Results
- `node --check tests/tools/ToolSchemaStrictModeValidation.test.mjs` -> PASS
- `node --check tests/tools/ToolWorkspaceSchemaManifestBoundaries.test.mjs` -> PASS
- strict object audit across `tools/schemas/**/*.json` -> PASS (`issues: 0`)
- `node -e "import { run } from './tests/tools/ToolSchemaStrictModeValidation.test.mjs'; await run();"` -> PASS
- `npm run test:launch-smoke -- --tools` -> PASS (`PASS=287 FAIL=0 TOTAL=287`, includes sample `1902` PASS)

## Scope Confirmations
- No samples changed outside `samples/phase-19/1902/`.
- No `start_of_day` folders modified.
- No fallback/default/hidden data added.
