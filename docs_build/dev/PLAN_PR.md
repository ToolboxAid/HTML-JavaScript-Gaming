# PLAN_PR: Move JSON schemas under tools ownership

## Purpose
Move schema contracts out of the repository root and into the tools area so schema ownership matches the systems that load, edit, validate, and export tool/sample data.

## Scope
- Do not change runtime behavior directly.
- Do not edit locked samples.
- Do not modify start_of_day folders.
- Establish schema placement rules for Codex to implement in the next pass.

## Schema placement rule
Use this structure:

```text
toolbox/
  schemas/
    tool.manifest.schema.json
    palette.schema.json
    samples/
      sample.tool-payload.schema.json
    toolbox/
      vector-map-editor.schema.json
      vector-asset-studio.schema.json
      sprite-editor.schema.json
```

## Rationale
Schemas belong near tool contracts, not at repository root. The root should stay clean and should not accumulate validation artifacts.

Shared schemas live at `src/shared/schemas/`.
Tool-specific schemas live at `src/shared/schemas/tools/<tool>.schema.json`.

## Acceptance criteria
- No new schema files are added at repository root.
- All JSON schema files are under `src/shared/schemas/`.
- Tool manifest validation uses `src/shared/schemas/tool.manifest.schema.json`.
- Tool-specific payload validation uses `src/shared/schemas/tools/<tool>.schema.json`.
- Samples reference the same tool schema contracts used by tool manifests.
