# BUILD_PR_11_17_SCHEMA_SET_NORMALIZATION_AND_WORKSPACE_REF_ENFORCEMENT

## Required Codex Work

### 1. Use uploaded schema set as source material
Review the complete schema set from the repo equivalent of:
- `tools/schemas/*.schema.json`
- `tools/schemas/tools/*.schema.json`

The uploaded candidate set contained:
- `workspace.schema.json`
- `workspace.manifest.schema.json`
- `palette.schema.json`
- `sample.tool-payload.schema.json`
- `tool.manifest.schema.json`
- tool schemas for asset-browser, sprite-editor, vector-map-editor, vector-asset-studio, tile-map-editor, parallax-editor, palette-browser, state-inspector, replay-visualizer, performance-profiler, physics-sandbox, asset-pipeline-tool, tile-model-converter, 3d-json-payload-normalizer, 3d-asset-viewer, 3d-camera-path-editor, skin-editor

### 2. Correct workspace.manifest schema
Update:
`tools/schemas/workspace.manifest.schema.json`

Required model:
```json
{
  "type": "object",
  "required": ["tools"],
  "additionalProperties": false,
  "properties": {
    "tools": {
      "type": "object",
      "required": ["palette"],
      "additionalProperties": false,
      "properties": {
        "palette": { "$ref": "..." },
        "asset-browser": { "$ref": "tools/asset-browser.schema.json" }
      }
    }
  }
}
```

Rules:
- remove top-level `palettes`
- palette is singular at `tools.palette`
- list all supported Workspace tool keys
- use `$ref` to each tool schema
- no duplicate hand-written schema bodies when a tool schema exists
- no aliases; use actual registry ids only

### 3. Palette schema handling
If Palette has a canonical schema:
- `$ref` that schema at `tools.palette`

If only `palette-browser.schema.json` exists:
- distinguish the palette tool payload from the palette browser tool payload
- create/update a canonical palette tool schema only if needed
- keep it singular

### 4. Validate tool ids against registry
Use the actual tool registry as the authoritative list of supported tool ids.
Do not use display names as schema keys.
Do not invent aliases such as both `tilemap-studio` and `tile-map-editor`.

### 5. Validate every schema
Add or run validation that checks:
- all schema files parse
- `$ref` targets resolve
- Workspace manifest rejects unknown tool keys
- Workspace manifest rejects invalid tool payloads
- Workspace manifest accepts valid 1902 payload

### 6. Rebuild only sample 1902 if needed
Update:
`samples/phase-19/1902/sample.1902.workspace-all-tools.json`

Rules:
- conform to corrected schemas
- all tool payloads under `tools`
- palette only at `tools.palette`
- no `sample.1902.palette.json`
- no copied unrelated game/sample payloads
- no duplicate `config` / `payload` branches
- no fallback/default/hidden data

### 7. Validation report
Create:
`docs/dev/reports/PR_11_17_SCHEMA_SET_NORMALIZATION_AND_WORKSPACE_REF_ENFORCEMENT_report.md`

Report must include:
- schema files changed
- tool keys listed in workspace manifest
- `$ref` target for each tool key
- missing schemas and how they were handled
- sample 1902 validation result
- unknown-key rejection test result
- invalid-payload rejection test result
- Workspace UI validation result showing tools available beyond Palette
- confirmation only sample 1902 changed
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- Schema SSoT correction + 1902 conformance only.
- Do not modify other samples.
- Do not broaden Workspace behavior beyond schema conformance.
