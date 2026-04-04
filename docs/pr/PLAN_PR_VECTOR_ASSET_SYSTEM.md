# PLAN_PR_VECTOR_ASSET_SYSTEM

## Goal
Define a first-class vector asset system that integrates with the accepted platform baseline and allows
SVG-authored/vector-defined content to participate in registry, dependency graph, validation, packaging,
runtime, debug, profiler, publishing, and template flows without changing engine core APIs.

## Why This PR Exists
The flagship Asteroids demo is a strong proof of platform, but Asteroids-style content is naturally vector-oriented.
The current platform baseline proves sprite, tilemap, parallax, packaging, runtime, and publishing flows, but it
does not yet establish vector assets as a first-class registry-owned type.

This PR defines that missing layer and uses the existing SVG-focused tooling as the authoring bridge.

## Intent
- Add a real vector asset type
- Treat SVG authoring as a platform input path
- Preserve all existing accepted platform boundaries
- Ignore the original legacy `SpriteEditor` naming and standardize tool naming going forward

## Scope
- define `vector` as a first-class asset type
- define vector asset storage and identity contracts
- define SVG authoring-to-vector normalization rules
- define registry and dependency graph participation for vector assets
- define validation rules for vector assets
- define packaging/runtime contracts for vector assets
- define debug/profiler visibility expectations for vector assets
- define naming normalization plan for tool directories and labels

## Non-Goals
- No engine core API changes
- No destructive migration of accepted asset types
- No bypass of validation, packaging, runtime, CI, or publishing boundaries
- No requirement to preserve legacy tool naming in future-facing UX
- No forced conversion of all existing sprite assets into vectors

## Proposed Asset Type
Vector assets become first-class registry-owned entries.

Example logical IDs:
- `vector.asteroids.ship`
- `vector.asteroids.asteroid.large`
- `vector.asteroids.asteroid.medium`
- `vector.asteroids.asteroid.small`
- `vector.asteroids.ui.title`

## Proposed File Placement
```text
games/Asteroids/platform/assets/vectors/
shared/vector/
tools/Vector Asset Studio/
```

## Proposed Data Shape
```json
{
  "id": "vector.asteroids.ship",
  "type": "vector",
  "source": {
    "kind": "svg",
    "path": "games/Asteroids/platform/assets/vectors/asteroids-ship.vector.json"
  },
  "geometry": {
    "paths": [],
    "closed": false
  },
  "style": {
    "stroke": true,
    "fill": false
  },
  "assetRefs": {}
}
```

## Core Contracts
1. Vector assets are registry-owned and ID-driven.
2. SVG authoring is an input path, not an exception path.
3. Dependency graph records vector asset relationships exactly like other first-class asset types.
4. Validation must reject malformed or incomplete vector definitions deterministically.
5. Packaging must include vector definitions in deterministic order.
6. Runtime must consume packaged vector assets through a defined runtime handoff contract.
7. Debug, profiler, export, template, and publishing systems must be able to surface vector asset participation.
8. No engine core APIs are changed.

## SVG Authoring Bridge
The SVG-focused editor becomes the preferred authoring surface for vector assets.
It should output normalized vector asset definitions rather than staying a disconnected tool.

Authoring flow:
1. Create/edit vector shape in SVG-oriented editor
2. Normalize shape/path data to platform vector asset form
3. Save into project-owned vector asset location
4. Register in asset registry
5. Validate
6. Package
7. Load in runtime

## Runtime Expectations
Runtime should support vector rendering as packaged content, with deterministic load order and fail-fast behavior
consistent with the strict runtime model already accepted by the platform.

## Validation Expectations
Validation should cover:
- missing vector IDs
- malformed path data
- invalid geometry definitions
- missing required references
- duplicate vector IDs
- incompatible packaging/runtime handoff data

## Debug / Profiler Expectations
Debug views should surface vector nodes and edges alongside other asset types.
Profiler should be able to report vector load/render timing where supported.

## Tool Naming Normalization Plan
Going forward, tool names should describe what the tools actually are, using normalized spelling and spacing.
Ignore the original legacy `SpriteEditor` label and naming pattern.

### Proposed tool rename map
- `tools/Sprite Editor/` → `tools/Pixel Asset Studio/`
- `tools/Tile Map Editor/` → `tools/Tilemap Studio/`
- `tools/Parallax Editor/` → `tools/Parallax Scene Studio/`
- `tools/SVG Editor/` → `tools/Vector Asset Studio/`

### UI/Docs naming expectations
- Use human-readable titles with normalized spacing
- Use stable folder names that match displayed tool identity
- Avoid mixed naming styles like `SpriteEditor`, `Sprite Editor`, and other legacy variations
- Treat future docs, PRs, and user-facing references as authoritative on the normalized names

## Rename Constraints
- Preserve backward compatibility where practical through transitional references
- Keep existing accepted content paths working during migration windows
- Avoid broad destructive repo moves unless BUILD explicitly controls them
- Document legacy-to-new naming clearly in BUILD/APPLY

## Likely Files
- `docs/pr/BUILD_PR_VECTOR_ASSET_SYSTEM.md`
- `shared/vector/*`
- `tools/Vector Asset Studio/*`
- transitional tool path/reference docs
- docs/dev reports
- no engine core API files

## Manual Validation Checklist
1. Vector asset can be authored from SVG-oriented tooling.
2. Vector asset is stored as registry-owned project content.
3. Dependency graph includes vector relationships.
4. Validation catches malformed vector definitions.
5. Packaging includes vector assets deterministically.
6. Runtime can consume packaged vector assets.
7. Tool names are normalized in docs and planned paths.
8. Legacy naming is documented without being treated as the target standard.
9. No engine core APIs are changed.

## Approved Commit Comment
plan(vector-assets): define first-class vector asset system and normalized tool naming

## Next Command
BUILD_PR_VECTOR_ASSET_SYSTEM
