# PR 8.10 — Sample Multi-File Tool Payload Alignment

## Purpose
Clarify that "multiple tools" in samples means multiple files, not arrays inside a single file.

Each file represents a single tool payload and matches the exact format used in workspace/game manifest tool entries.

## Key Correction

### ❌ WRONG (array inside one file)
```json
{
  "tools": [ ... ]
}
```

### ✅ CORRECT (multiple files)
```
sample.0305.vector-map-editor.json
sample.0305.vector-asset-studio.json
```

Each file:
- references ONE tool schema
- contains ONE tool payload
- is identical in shape to what goes inside:
  workspace.manifest.json → games[].tools[]

## File Naming Standard

```
sample.<id>.<tool>.json
```

Examples:
- sample.0305.vector-map-editor.json
- sample.0305.palette-editor.json
- sample.0101.sprite-editor.json

## Payload Rule

Each sample tool file MUST match EXACTLY the structure used in game/workspace manifests.

Example:

```json
{
  "$schema": "../../../tools/vector-map-editor/tool.schema.json",
  "tool": "vector-map-editor",
  "config": {}
}
```

This is identical to:

```json
{
  "tools": [
    {
      "tool": "vector-map-editor",
      "config": {}
    }
  ]
}
```

## Rules

- One file = one tool
- No arrays inside sample files
- File = tool payload
- Same structure as workspace manifest tool entry
- $schema must point to tool schema
- Naming must be deterministic
- No wrapper objects (no documentKind, no sample envelope)

## Palette

If needed:
```
sample.palette.json
```

Referenced by convention, not embedded.

## Non-Goals

- No runtime logic
- No validators
- No workspace schema changes

## Acceptance

- No sample files contain tools arrays
- All sample tool files match workspace tool payload shape
- Naming convention enforced
