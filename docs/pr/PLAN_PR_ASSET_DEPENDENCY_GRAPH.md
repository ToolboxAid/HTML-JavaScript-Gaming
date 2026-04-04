# PLAN_PR_ASSET_DEPENDENCY_GRAPH

## Goal
Define a docs-first, additive project-level asset dependency graph that describes relationships between
registry-owned assets without changing engine core APIs.

## Context
The project baseline now assumes registry-aware editors:
- Sprite Editor
- Tile Map Editor
- Parallax Editor

The next architectural layer is a dependency graph that improves validation, visibility, packaging readiness,
and safe editor-to-editor asset tracing.

## Scope
- Define graph storage under project-owned data
- Define node and edge contracts
- Define additive and backward-compatible persistence rules
- Define editor contribution boundaries
- Define validation/reporting expectations
- Define rollout assumptions for BUILD and APPLY

## Non-Goals
- No engine changes
- No runtime dependency resolver
- No forced migration of legacy projects
- No export/packaging implementation in this PLAN

## Proposed Data Shape
```json
{
  "project": {
    "assetDependencyGraph": {
      "version": 1,
      "nodes": {},
      "edges": []
    }
  }
}
```

## Node Types
- sprite
- palette
- tileset
- tilemap
- parallaxLayer
- image

## Edge Types
- usesPalette
- usesSprite
- usesTileset
- usesImage
- containsLayer
- containsTilemap

## Core Contracts
1. Registry remains source of truth.
2. Graph is additive and reconstructable.
3. IDs remain authoritative.
4. Missing targets do not hard-fail editor workflows.
5. Legacy projects may omit the graph and still load.
6. Orphaned nodes are allowed but reportable.
7. Circular relationships must be detectable where disallowed.

## Editor Responsibilities
### Sprite Editor
- Contribute sprite -> palette relationships

### Tile Map Editor
- Contribute tilemap -> tileset and related asset links

### Parallax Editor
- Contribute parallaxLayer -> image links

## Validation Targets
- Missing target IDs surfaced as findings
- Duplicate node IDs handled deterministically
- Duplicate edges de-duplicated where appropriate
- Save/load remains stable
- No engine API changes

## Next Command
BUILD_PR_ASSET_DEPENDENCY_GRAPH
