# PR 8.4 — Palette Schema: swatches + symbol

## Purpose
Align palette schema with actual usage:
- Replace `entries` → `swatches`
- Add single-character `symbol`
- Normalize `hex` naming

## Changes

### Schema Updates
`tools/schemas/palette.schema.json`

- Rename:
  - `entries` → `swatches`
- Swatch shape:
```json
{
  "symbol": "!",
  "hex": "#FFFFFF",
  "name": "white"
}
```

### Rules
- `symbol` MUST be single character
- Unique per palette
- Deterministic ordering preserved
- `hex` uppercase
- No multi-char symbols (remove s001 style)

### Generation Updates
- Replace generated ids:
  - OLD: s001
  - NEW: single ASCII symbols set

### Recommended Symbol Set Order
```
! @ # $ % ^ & * ( ) - + = ~ ? / < >
A B C D E F G H I J K L M N O P
```

## Non-Goals
- No runtime logic
- No validators
- No sample behavior changes

## Acceptance
- All palettes use `swatches`
- All swatches use single-character `symbol`
- Schema enforces constraints
