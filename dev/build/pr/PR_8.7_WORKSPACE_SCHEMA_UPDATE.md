# PR 8.7 — Workspace Schema Update (id + type)

## Purpose
Align workspace.schema.json with new manifest structure using:
- id
- type

## Changes

### workspace.schema.json

#### Replace
- sampleId

#### With
- id (string, required)
- type (string, required)

### Entry Shape
```json
{
  "id": "0305",
  "type": "sample",
  "tool": "vector-map-editor",
  "palette": "samples/phase-03/0305/sample.palette.json"
}
```

### Rules
- id must be unique
- type required
- tool required
- palette optional
- no additionalProperties

## Non-Goals
- no runtime logic
- no validators

## Acceptance
- schema matches manifest structure
- no references to sampleId remain
