# PR_26133_032 Object Vector Schema Geometry Style SSoT Report

Task: PR_26133_032-object-vector-schema-geometry-and-style-ssot
Date: 2026-05-14

## Result

PASS - Object Vector Studio V2 schema, editor, Asteroids manifest data, and runtime object-vector rendering now share the reduced object-vector contract.

## Schema Contract

- Removed `assetLibrary` from the Object Vector Studio V2 payload contract.
- Moved durable tags onto `objects[*].tags`.
- Kept `objects[*].id` as the runtime/gameplay single source of truth.
- Added independent `style.fillOpacity` and `style.strokeOpacity`.
- Removed legacy `style.opacity`.
- Changed transform origin from `originX` / `originY` to `origin: { x, y }`.
- Changed line geometry from split `x1` / `y1` / `x2` / `y2` to `point1` / `point2`.
- Added `triangleGeometry` with exactly 3 points.
- Updated polygon geometry to require at least 4 points and default to 5 points.

## Manifest/Data Migration

- `games/Asteroids/game.manifest.json` no longer carries Object Vector `assetLibrary`.
- Asteroids object tags now live on object entries.
- Object shapes use `fillOpacity` / `strokeOpacity`.
- Line shapes use `point1` / `point2`.
- Shape transforms and frame override transforms use `origin`.
- Triangle-tool shapes validate against exact 3-point triangle geometry.

## Editor/Runtime Updates

- Palette controls expose independent Fill Op and Stroke Op number fields.
- Palette color application preserves existing fill/stroke color behavior and writes the selected opacity field only when changed.
- Object Geometry reads/writes nested point2d line fields.
- Polygon Add/Delete Point preserves the new 4-point minimum.
- Triangle Add/Delete Point remains hidden and exact point count is enforced.
- Runtime canvas/SVG rendering applies fill and stroke alpha independently.
- Runtime validation enforces `maxItems` so triangle geometry cannot exceed 3 points.

## Validation

- PASS - `npm run test:workspace-v2` (49 passed, 0 failed).
- PASS - `games/Asteroids/game.manifest.json` validated against `tools/schemas/game.manifest.schema.json`.
- PASS - embedded Asteroids Object Vector payload validated through `ObjectVectorStudioV2SchemaService`.
- PASS - changed JS syntax checks for Object Vector editor/runtime files and Workspace Manager V2 Playwright spec.

## Manual Verification Notes

Targeted Object Vector Studio V2 browser coverage in the Workspace V2 suite verified fill/stroke opacity editing, palette color sync, polygon point add/delete constraints, line point2d layout, transform origin edits, no `assetLibrary` requirement, Asteroids runtime rendering, and no monitored console/page errors.
