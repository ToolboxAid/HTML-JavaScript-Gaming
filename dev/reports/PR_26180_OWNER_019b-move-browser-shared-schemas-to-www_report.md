# PR_26180_OWNER_019b-move-browser-shared-schemas-to-www Report

## Executive Summary

Moved the PR019a-audited active browser/runtime shared contract and tool schema files from root `src/shared/` into `www/src/shared/`.

This preserves public browser route compatibility because the local/static web root serves `www/`, so URLs such as `/src/shared/schemas/tools/palette-browser.schema.json` still resolve to `www/src/shared/schemas/tools/palette-browser.schema.json`.

No API/server-owned files, validation-only files, protected developer workspace files, UI pages, database files, or product behavior were moved.

## Stack Context

- Workstream: Repository Architecture Simplification
- Previous dependency: `PR_26180_OWNER_019a-contracts-schemas-obsolescence-audit`
- Base branch: `PR_26180_OWNER_019a-contracts-schemas-obsolescence-audit`
- Source branch: `PR_26180_OWNER_019b-move-browser-shared-schemas-to-www`
- Intended next dependency: remaining server/API and dev-owned `src/` retirement PRs

## Source Of Truth

Used `dev/reports/PR_26180_OWNER_019a-contracts-schemas-obsolescence-audit_audit.csv`.

Only rows classified as `Active browser/runtime dependency` with recommendation `move to www/` were moved.

## Moved Files

- src/shared/contracts/replayContracts.js -> www/src/shared/contracts/replayContracts.js
- src/shared/schemas/tools/3d-asset-viewer.schema.json -> www/src/shared/schemas/tools/3d-asset-viewer.schema.json
- src/shared/schemas/tools/3d-camera-path-editor.schema.json -> www/src/shared/schemas/tools/3d-camera-path-editor.schema.json
- src/shared/schemas/tools/3d-json-payload.schema.json -> www/src/shared/schemas/tools/3d-json-payload.schema.json
- src/shared/schemas/tools/asset-manager-v2.schema.json -> www/src/shared/schemas/tools/asset-manager-v2.schema.json
- src/shared/schemas/tools/asset-pipeline.schema.json -> www/src/shared/schemas/tools/asset-pipeline.schema.json
- src/shared/schemas/tools/audio-sfx-playground-v2.schema.json -> www/src/shared/schemas/tools/audio-sfx-playground-v2.schema.json
- src/shared/schemas/tools/collision-inspector-v2.schema.json -> www/src/shared/schemas/tools/collision-inspector-v2.schema.json
- src/shared/schemas/tools/input-mapping-v2.schema.json -> www/src/shared/schemas/tools/input-mapping-v2.schema.json
- src/shared/schemas/tools/midi-studio-v2.schema.json -> www/src/shared/schemas/tools/midi-studio-v2.schema.json
- src/shared/schemas/tools/object-vector-studio-v2.schema.json -> www/src/shared/schemas/tools/object-vector-studio-v2.schema.json
- src/shared/schemas/tools/palette-browser.schema.json -> www/src/shared/schemas/tools/palette-browser.schema.json
- src/shared/schemas/tools/palette-manager-v2.schema.json -> www/src/shared/schemas/tools/palette-manager-v2.schema.json
- src/shared/schemas/tools/parallax-editor.schema.json -> www/src/shared/schemas/tools/parallax-editor.schema.json
- src/shared/schemas/tools/performance-profiler.schema.json -> www/src/shared/schemas/tools/performance-profiler.schema.json
- src/shared/schemas/tools/physics-sandbox.schema.json -> www/src/shared/schemas/tools/physics-sandbox.schema.json
- src/shared/schemas/tools/replay-visualizer.schema.json -> www/src/shared/schemas/tools/replay-visualizer.schema.json
- src/shared/schemas/tools/sprite-editor.schema.json -> www/src/shared/schemas/tools/sprite-editor.schema.json
- src/shared/schemas/tools/state-inspector.schema.json -> www/src/shared/schemas/tools/state-inspector.schema.json
- src/shared/schemas/tools/svg-asset-studio.schema.json -> www/src/shared/schemas/tools/svg-asset-studio.schema.json
- src/shared/schemas/tools/text2speech-V2.schema.json -> www/src/shared/schemas/tools/text2speech-V2.schema.json
- src/shared/schemas/tools/tile-map-editor.schema.json -> www/src/shared/schemas/tools/tile-map-editor.schema.json
- src/shared/schemas/tools/vector-map-editor.schema.json -> www/src/shared/schemas/tools/vector-map-editor.schema.json

## Path Updates

- Updated active tool/schema tests to read browser tool schemas from `www/src/shared/schemas/tools/`.
- Updated `dev/scripts/validate-json-contracts.mjs` so tool schema validation indexes `www/src/shared/schemas/tools/` while still indexing remaining root `src/shared/schemas/` files.
- Updated Project Instructions version/state/canonical structure/backlog to record the browser schema/contract ownership split.

## Compatibility Decision

Schema `$id` values and browser string identifiers remain in the public `src/shared/schemas/tools/...` form. This is intentional because the public browser URL shape remains `/src/shared/...` under the `www` web root.

## Scope Guard

- Runtime behavior changed: No
- Product/UI pages changed: No
- API/server files moved: No
- Database files changed: No
- Protected developer workspace moved: No
