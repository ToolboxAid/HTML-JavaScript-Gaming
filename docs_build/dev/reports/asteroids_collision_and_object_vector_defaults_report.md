# PR_26133_033 Asteroids Collision And Object Vector Defaults Report

Date: 2026-05-14

## Scope

This change restores Asteroids collision behavior and moves Object Vector Studio V2 object/shape creation defaults into schema definitions while keeping object ids as the runtime SSoT.

## Collision Fixes

- Updated Asteroids asteroid collision-profile extraction to read point geometry from shape `tool: "polygon"`, matching the reduced Object Vector schema contract.
- Confirmed Asteroids small, medium, and large asteroid profiles load polygon collision points from `games/Asteroids/game.manifest.json -> game.workspace.tools["object-vector-studio-v2"].objects[*].shapes[*].geometry`.
- Added ship bullet vs UFO bullet crossfire collision resolution.
- Preserved existing ship/asteroid, bullet/asteroid, UFO/asteroid, UFO bullet/asteroid, and ship/UFO crash collision flows.
- No vector-map-editor fallback geometry was added or restored.

## Schema Defaults

- Added defaults to `toolbox/schemas/game.manifest.schema.json` for Object Vector Studio V2 object, shape common fields, style, transform, point2d, and all supported geometry definitions.
- Mirrored the same defaults in `toolbox/schemas/tools/object-vector-studio-v2.schema.json` for standalone Object Vector Studio V2 validation/loading.
- Added whole-object defaults for polygon and triangle geometry; polygon defaults use five points, and triangle defaults use exactly three points.

## Tool Default Loading

- Added `ObjectVectorStudioV2SchemaService.getDefinitionDefault()` so Object Vector Studio V2 clones defaults from the loaded schema.
- New object creation now starts from the schema object default and applies the user-entered id/name/tags.
- New shape creation now reads shape common, style, transform, and geometry defaults from schema definitions.
- Missing schema defaults now produce visible blocked create/add failures instead of silent hardcoded fallback creation.
- Shape transform origin remains derived from the created geometry bounds so current editing behavior stays centered; the transform base values come from the schema default.

## Workspace Launch

- Workspace Manager V2 generated Asteroids Object Vector payloads were verified with no `assetLibrary` field.
- Generated `objects[*].tags` were verified present, including `object.asteroids.asteroid.small` tags `["asteroid", "small"]` loaded from the Asteroids manifest.

## Validation

- PASS - `npm run test:workspace-v2` -> 49 passed.
- PASS - targeted Asteroids collision timing/stress checks for collision profiles and requested collision pairs.
- PASS - targeted Asteroids validation smoke.
- PASS - Node schema validation for `games/Asteroids/game.manifest.json` and generated workspace manifest.
- PASS - search check found no Asteroids vector-map fallback geometry or `assetLibrary` payload usage outside schema rejection guards.
