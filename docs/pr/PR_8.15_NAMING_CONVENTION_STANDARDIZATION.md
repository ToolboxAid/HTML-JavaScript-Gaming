# PR 8.15 — Naming Convention Standardization

## Purpose
Eliminate confusion between:
- tool payload files
- palette data files

Clarify naming so humans can instantly understand file purpose.

## Current State (Valid but Confusing)

- sample.0213.palette-browser.json  ✅ (tool payload)
- sample.0213.palette.json          ✅ (palette data)

These are BOTH correct, but visually similar.

## Final Naming Model

### Tool Payload Files (UNCHANGED)
```
sample.<id>.<tool>.json
```

Examples:
- sample.0213.palette-browser.json
- sample.0207.sprite-editor.json

### Palette Data Files (UNCHANGED NAME, BUT REDEFINED ROLE)
```
sample.<id>.palette.json
```

This is NOT a tool.

## Key Clarification

"palette-browser" is a TOOL  
"palette" is DATA

## New Rule (IMPORTANT)

### Tool Payload Detection Rule
A file is a TOOL PAYLOAD if:
- it contains `"tool": "<tool-name>"`

### Palette File Detection Rule
A file is a PALETTE if:
- `$schema` = palette.schema.json
- contains `"swatches"`

## Human-Readable Rule

If filename has 3 segments:
- sample.0213.X.json → TOOL

If filename has 2 segments:
- sample.0213.palette.json → DATA

## Forbidden Future Patterns

Do NOT create:
- sample.<id>.palette-browser.palette.json
- sample.<id>.palette-data.json
- sample.<id>.colors.json

## Optional (NOT REQUIRED NOW)

Future improvement (DO NOT IMPLEMENT IN THIS PR):
```
sample.<id>.data.palette.json
```

But current naming is ACCEPTED and LOCKED.

## Acceptance

- No renaming required (repo already compliant)
- Naming rules documented
- No ambiguity for future contributors
