# Samples2Tools Adapter Guidance

## Purpose
- Define one shared launch and hydration pattern so a sample preset can load into tools without per-tool URL conventions.
- Keep the source of truth in sample JSON files (`samples/phase-xx/xxxx/*.json`), not duplicated tool-only payloads.

## Shared Launch Contract
- Query params:
- `sampleId=<id>`
- `samplePresetPath=/samples/phase-xx/xxxx/sample-xxxx-toolID.json`
- Rules:
- Reject empty/invalid paths.
- Normalize path separators to `/`.
- Reject traversal (`..`) in preset paths.
- Allow only sample-local/known-safe relative forms.

## Canonical Preset Shape
- Required:
- `sampleId`
- `phase`
- `title`
- `description`
- `toolHints`
- `payload`
- Optional:
- `runtime`
- `toolState`
- `provenance`

## Adapter Pattern (Per Tool)
- Steps:
1. Read `samplePresetPath` and `sampleId` from `window.location.search`.
2. Fetch preset JSON with `{ cache: "no-store" }`.
3. Extract tool-relevant block from `payload` (or fallback to direct tool document shape when intentionally supported).
4. Validate/minimally sanitize into tool schema.
5. Apply to tool state.
6. Emit user status text: `Loaded preset from sample <id>.` (or path fallback).

## Reference Implementations
- Parallax Scene Studio:
- `extractParallaxDocumentFromSamplePreset(...)`
- `tryLoadPresetFromQuery(...)`
- File: `tools/Parallax Scene Studio/main.js`

- Tilemap Studio:
- `extractTileMapDocumentFromSamplePreset(...)`
- `tryLoadPresetFromQuery(...)`
- File: `tools/Tilemap Studio/main.js`

- Vector Asset Studio:
- `extractVectorAssetPresetFromSamplePreset(...)`
- `tryLoadPresetFromQuery(...)`
- File: `tools/Vector Asset Studio/main.js`

## Data Rules
- Do not use `imageDataUrl` in persisted sample/tool/workspace JSON.
- Persist path/file references only (for example `imageName`, `imageSource`, SVG path fields).
- Keep sample assets local to the sample folder whenever practical.

## Validation Checklist
- Sample page consumes the same JSON it passes to tools.
- Tool load succeeds from `samplePresetPath` without manual edits.
- Tool shows loaded source status with sample id/path.
- Direct launch (without preset params) still works.
- No coupling to Phase 20 preset lanes.

## Current Verified Vertical Slice
- Sample `1208`:
- tool-specific preset files exist (`sample-1208-tile-map-editor.json`, `sample-1208-parallax-editor.json`, `sample-1208-vector-asset-studio.json`)
- roundtrip links pass `sampleId` + `samplePresetPath`
- Parallax, Tilemap, and Vector Asset Studio implement query preload adapters
