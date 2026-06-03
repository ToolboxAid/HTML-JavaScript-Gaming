# PR 8.3 — Sample Color Palette Generation

## Purpose
Generate schema-compliant sample palette documents from colors actually used by each sample.

## Scope
- Do not assume `samples/**/config.json` exists.
- Do not assume `samples/**/*.palette.json` exists.
- Scan each sample's existing JSON payloads and related sample assets for color values.
- Generate palette documents only from colors found in the sample.
- Add `$schema` references to generated palette documents.
- Keep `workspace.manifest` as source of truth.
- Keep shared schemas in `tools/schemas/`.

## Required Output Shape
Generated palette files must conform to:

`tools/schemas/palette.schema.json`

Expected shared palette document shape:

```json
{
  "$schema": "../../../tools/schemas/palette.schema.json",
  "schema": "palette",
  "version": "1.0.0",
  "name": "Sample 0101 Palette",
  "source": "generated-from-sample-colors",
  "entries": [
    {
      "name": "color-001",
      "value": "#000000"
    }
  ]
}
```

## Generation Rules
- Extract only explicit color values used by the sample.
- Supported color formats:
  - `#RGB`
  - `#RRGGBB`
  - `#RRGGBBAA`
  - `rgb(...)`
  - `rgba(...)`
  - named CSS colors only if already present in sample files
- Normalize hex colors to uppercase `#RRGGBB` unless alpha is required.
- Deduplicate colors per sample.
- Preserve deterministic ordering.
- Use stable generated names:
  - `color-001`
  - `color-002`
  - `color-003`
- Do not invent colors.
- Do not generate empty palettes unless the sample already has no color data and a manifest entry requires one.

## Non-Goals
- No runtime validation utilities.
- No implementation behavior changes.
- No start_of_day changes.
- No repo-wide architectural rewrite.
- No sample gameplay changes.

## Acceptance
- Palette files exist only where sample color data exists or where the manifest requires them.
- Generated palettes validate against `tools/schemas/palette.schema.json`.
- All generated palette files include `$schema`.
- No references to nonexistent `samples/**/config.json` or `samples/**/*.palette.json` remain in PR docs.
