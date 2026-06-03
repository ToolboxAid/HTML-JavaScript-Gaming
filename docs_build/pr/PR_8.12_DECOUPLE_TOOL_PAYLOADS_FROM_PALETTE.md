# PR 8.12 — Decouple Tool Payloads From Palette

## Purpose
Correct the sample palette linkage rule.

Tool payload JSON must remain the exact same schema shape used inside workspace/game manifests.

A tool file must not contain a direct `palette` reference.

## Key Correction

### Wrong
```json
{
  "$schema": "../../../tools/schemas/tools/sprite-editor.schema.json",
  "tool": "sprite-editor",
  "version": 1,
  "palette": "./sample.palette.json",
  "config": {}
}
```

### Correct
```json
{
  "$schema": "../../../tools/schemas/tools/sprite-editor.schema.json",
  "tool": "sprite-editor",
  "version": 1,
  "config": {}
}
```

When opening a tool, the launcher passes:
1. the tool payload JSON
2. the palette object JSON

This matches workspace layout.

## Rule
Sample tool payload files must be identical in shape to workspace manifest `tools[]` entries.

## Required Changes
- Remove `palette` from every `sample.<id>.<tool>.json` file.
- Keep `sample.palette.json` as a separate file when colors exist.
- Do not embed palette paths inside tool payload files.
- Do not change the tool schemas to require palette.
- Keep palette object loading separate from tool payload loading.

## Example

Sample folder:

```text
samples/phase-02/0207/
  sample.0207.sprite-editor.json
  sample.palette.json
```

Tool payload:

```json
{
  "$schema": "../../../tools/schemas/tools/sprite-editor.schema.json",
  "tool": "sprite-editor",
  "version": 1,
  "config": {}
}
```

Palette object:

```json
{
  "$schema": "../../../tools/schemas/palette.schema.json",
  "schema": "html-js-gaming.palette",
  "version": 1,
  "name": "Sample 0207 Palette",
  "source": "generated-from-sample-colors",
  "swatches": []
}
```

## Acceptance
- `sample.0207.sprite-editor.json` has no `palette` field.
- No `sample.<id>.<tool>.json` file has a `palette` field.
- Tool schemas remain consistent with workspace `tools[]` entries.
- Palette files remain separate and schema-compliant.
- No runtime logic changes.
- No validators added.
- No `start_of_day` changes.
