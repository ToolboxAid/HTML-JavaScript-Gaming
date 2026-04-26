# PR 8.6 — Manifest Entity Generalization

## Purpose
Remove sample-specific naming and generalize manifest structure to support samples, games, and future entity types.

## Change

### Replace
- sampleId

### With
- id
- type

### New Structure
```json
{
  "id": "0305",
  "type": "sample",
  "tool": "vector-map-editor",
  "palette": "samples/phase-03/0305/sample.palette.json"
}
```

## Type Values
- sample
- game
- tool (future)
- asset (future)

## Rules
- id must be unique across manifest
- type required
- palette optional but must be explicit if present
- no implicit inference

## Non-Goals
- no runtime logic
- no validators

## Acceptance
- no sampleId remains
- all entries use id + type
