# PR 8.14 — Palette Naming Normalization

## Problem
Duplicate palette files exist:
- sample.0213.palette.json
- sample.0213.palette-browser.json

This creates ambiguity and violates the “single palette per sample” rule.

## Decision

### Tool Files
Keep full tool names:
- sample.<id>.<tool>.json (GOOD)

### Palette Files
Palette is NOT tool-specific.

Palette is:
- shared across tools in the sample
- passed separately at runtime

### FINAL RULE

There must be EXACTLY ONE palette file per sample:

```
sample.<id>.palette.json
```

## Required Fix

For every sample folder:

1. KEEP:
   sample.<id>.palette.json

2. REMOVE:
   any tool-specific palette files:
   - sample.<id>.palette-browser.json
   - sample.<id>.sprite-editor.palette.json
   - any variation with tool name

3. If tool-specific palette contains unique data:
   - merge into canonical palette file BEFORE deletion

## Why

- Palette is shared resource
- Tool payloads are isolated
- Matches runtime contract:
  open(toolPayload, paletteObject)

## Rules

- One palette per sample
- Palette never includes tool name
- Tool files always include tool name
- No duplicate palette variants

## Acceptance

- Only one palette file per sample folder
- No files matching:
  sample.<id>.*palette*.json except canonical
- All palette data preserved via merge if needed
