# PR 8.13 — Palette File Naming and Reference Cleanup

## Purpose
Finish the palette/tool payload separation correctly.

Tool payload files must not contain embedded palette data, palette references, or palette asset reference fields.

Palette lock metadata belongs in the palette JSON file.

Palette file names must follow the same sample naming convention as tool payload files.

## Corrections

### Palette File Naming

#### Old
```text
sample.palette.json
```

#### New
```text
sample.<id>.palette.json
```

Examples:
```text
sample.0207.palette.json
sample.0305.palette.json
```

This matches:
```text
sample.0207.sprite-editor.json
sample.0305.vector-map-editor.json
```

## Required Tool Payload Cleanup

Remove palette-related fields from all sample tool payload files, including nested config fields.

Specifically remove occurrences like:

```json
"palette": []
```

```json
"paletteRef": {
  "source": "engine/paletteList",
  "id": "crayola008",
  "locked": true
}
```

```json
"assetRefs": {
  "paletteId": "",
  "spriteId": ""
}
```

If `assetRefs` contains only palette-related fields, remove `assetRefs`.

If `assetRefs` contains non-palette asset references, remove only palette-related keys and preserve the rest.

## Specific Known File
Fix the remaining issue in:

```text
samples/phase-02/0207/sample.0208.sprite-editor.json
```

Remove:
- `palette`
- `paletteRef`
- `assetRefs.paletteId`

Note: verify whether the file name `sample.0208.sprite-editor.json` belongs in folder `0207`. If it is a sample id mismatch, correct the file naming only if repo naming conventions confirm it should be `sample.0207.sprite-editor.json`.

## Palette Lock Rule

Palette lock metadata belongs in the palette file, not the tool payload.

Example:

```json
{
  "$schema": "../../../tools/schemas/palette.schema.json",
  "schema": "html-js-gaming.palette",
  "version": 1,
  "name": "Sample 0207 Palette",
  "source": "engine/paletteList",
  "sourceId": "crayola008",
  "locked": true,
  "swatches": []
}
```

## Schema Update

Update `tools/schemas/palette.schema.json` to allow optional top-level metadata:

```json
"sourceId": {
  "type": "string",
  "minLength": 1
},
"locked": {
  "type": "boolean"
}
```

Do not add these fields to swatches.

## Rules
- Tool payload files must match workspace `tools[]` item shape.
- Tool payload files must not contain palette object data.
- Tool payload files must not contain palette path refs.
- Tool payload files must not contain palette lock metadata.
- Palette files use `sample.<id>.palette.json`.
- Palette files own `locked` and source metadata.
- Palette files remain separate JSON objects passed beside the tool payload when opening a tool.

## Non-Goals
- No runtime changes.
- No validators.
- No `start_of_day` changes.
- No broad sample gameplay edits.

## Acceptance
- No sample tool payload file contains `palette`.
- No sample tool payload file contains `paletteRef`.
- No sample tool payload file contains `assetRefs.paletteId`.
- Palette files are named `sample.<id>.palette.json`.
- No `sample.palette.json` files remain.
- Locked palette metadata is present in the renamed palette JSON where applicable.
- Palette schema allows top-level `locked` and `sourceId`.
