# PR 8.5 — Workspace Manifest Palette Linking

## Purpose
Make workspace.manifest explicitly link palettes to samples.

## Changes

### workspace.manifest.json (schema expectation)
Each sample entry MUST declare:

```json
{
  "sampleId": "0305",
  "tool": "vector-map-editor",
  "palette": "samples/phase-03/0305/sample.palette.json"
}
```

### Rules
- Palette path REQUIRED when palette exists
- Path must be relative repo path
- No implicit palette discovery allowed
- workspace.manifest is the ONLY source of truth

### Validation Expectations
- Every palette file must be referenced by exactly one sample
- No orphan palettes
- No duplicate palette references

## Non-Goals
- No runtime logic
- No validators
- No schema engine changes

## Acceptance
- workspace.manifest fully links all palettes
- No palette exists without manifest reference
