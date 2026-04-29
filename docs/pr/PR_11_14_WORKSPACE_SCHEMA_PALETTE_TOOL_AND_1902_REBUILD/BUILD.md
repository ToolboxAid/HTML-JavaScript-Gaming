# BUILD_PR_11_14_WORKSPACE_SCHEMA_PALETTE_TOOL_AND_1902_REBUILD

## Required Codex Work

### 1. Update Workspace manifest schema
Update:
`tools/schemas/workspace.manifest.schema.json`

Required model:
- top-level `tools` remains required
- top-level `palettes` must be removed unless retained only for migration with clear deprecation
- Palette belongs under `tools.palette`
- only one `tools.palette` entry is allowed
- no multiple palette collection

Preferred manifest shape:
```json
{
  "tools": {
    "asset-browser": {},
    "sprite-editor": {},
    "vector-map-editor": {},
    "palette": {
      "id": "sample-1902-palette",
      "name": "Sample 1902 Palette",
      "swatches": []
    }
  }
}
```

### 2. Rebuild only sample 1902
Update only:
`samples/phase-19/1902/`

Rules:
- delete/remove any `sample.1902.palette.json`
- remove top-level `palettes`
- remove duplicated palette/config/payload blocks
- put palette data at `tools.palette`
- put each tool payload under its matching `tools.<toolId>` key
- no copied unrelated sample/game dump data
- no fallback/default/hidden data

### 3. Workspace schema file
Update the 1902 Workspace file so it uses the correct launcher/index schema and points to the updated manifest shape.

If 1902 uses a single combined file, it must still match the updated schema expected by the loader. Do not invent unsupported fields.

### 4. Validation
Create:
docs/dev/reports/PR_11_14_WORKSPACE_SCHEMA_PALETTE_TOOL_AND_1902_REBUILD_report.md

Report must include:
- schema changes
- final 1902 JSON structure
- confirmation palette is under `tools.palette`
- confirmation only one palette exists
- confirmation no palette sidecar remains
- Workspace validation showing more than Palette is available
- list of tools shown/resolved
- confirmation only sample 1902 was changed
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- Do not modify other samples.
- Do not modify standalone sample tool behavior.
- No broad Workspace refactor unless required to read the updated schema.
