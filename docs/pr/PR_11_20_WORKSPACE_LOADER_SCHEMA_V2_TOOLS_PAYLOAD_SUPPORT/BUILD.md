# BUILD_PR_11_20_WORKSPACE_LOADER_SCHEMA_V2_TOOLS_PAYLOAD_SUPPORT

## Required Codex Work

### 1. Inspect current Workspace loader path
Find where Workspace loads manifests and determines available tools.

Expected areas:
- tools/workspace*
- tools/shared/platformShell*
- tools/toolRegistry.js
- any schema validation utilities
- sample 1902 launch page only if required

### 2. Update loader to new manifest contract
Workspace must consume the corrected shape:

```json
{
  "$schema": ".../workspace.manifest.schema.json",
  "documentKind": "workspace-manifest",
  "schema": "html-js-gaming.project",
  "version": 1,
  "id": "sample-1902-workspace-all-tools",
  "name": "Sample 1902 Workspace All Tools",
  "tools": {
    "asset-browser": { "tool": "asset-browser", "version": "1", "payload": {} },
    "sprite-editor": { "tool": "sprite-editor", "version": "1", "payload": {} },
    "palette": { "tool": "palette-browser", "version": "1", "payload": {} }
  }
}
```

### 3. Build available tools from manifest.tools
Available tools must come from:
`Object.keys(manifest.tools)`

Then:
- validate key exists in Workspace-supported registry list
- validate payload `tool` matches the registered tool id or the documented special-case mapping for singular palette
- reject/report unknown keys
- do not silently drop valid tools

### 4. Palette mapping rule
Resolve the naming ambiguity explicitly:
- If schema uses `tools.palette` as the singular palette payload, map it to the Palette Browser tool UI.
- Do not treat Palette as the only workspace tool.
- Do not require a top-level `palettes` collection.
- Do not require a separate `sample.1902.palette.json`.

### 5. Remove old assumptions
Remove or bypass old loader behavior that expects:
- `palettes`
- `games[].tools`
- `activeWorkspaceTools`
- top-level `config`
- top-level `payload`
- broad sample tool-payload schema wrappers

unless still needed for legacy files and clearly documented as compatibility, not as the 1902 path.

### 6. Validation report
Create:
docs/dev/reports/PR_11_20_WORKSPACE_LOADER_SCHEMA_V2_TOOLS_PAYLOAD_SUPPORT_report.md

Report must include:
- files changed
- old loader assumption found
- new loader path
- all manifest tool keys discovered for sample 1902
- tool keys accepted
- tool keys rejected with reason
- proof Workspace shows more than Palette
- validation command/results
- confirmation no other samples changed
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- No schema loosening.
- No fallback/default/hidden data.
- No unrelated UI polish.
- No edits to standalone sample behavior.
