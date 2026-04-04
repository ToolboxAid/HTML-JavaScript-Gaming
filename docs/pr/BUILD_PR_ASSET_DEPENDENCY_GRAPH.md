# BUILD_PR_ASSET_DEPENDENCY_GRAPH

## Purpose
Implement the minimal additive asset dependency graph defined in PLAN_PR_ASSET_DEPENDENCY_GRAPH.

## Build Scope
- Add project-level asset dependency graph persistence
- Preserve registry as source of truth
- Generate stable nodes and deterministic edges
- Keep behavior additive and backward compatible
- Surface lightweight validation findings for missing/orphaned assets
- Avoid engine core API changes

## Required Contracts
- Graph may be omitted in legacy projects
- Graph can be reconstructed from registry-aware project data
- Editors contribute local relationships only
- Missing references must not crash load/edit flows
- Save/load must remain stable and deterministic

## Likely Files
- shared project registry/graph helper module
- editor project model adapters
- docs/dev reports for verification
- no engine core API files

## Manual Validation Checklist
1. Legacy projects load with no graph data.
2. Registry-aware projects save and reload graph additively.
3. Sprite/palette relationships remain stable.
4. Tile relationships remain stable.
5. Parallax/image relationships remain stable.
6. Missing targets produce findings, not crashes.
7. Graph output is deterministic enough to avoid noisy diffs.
8. Engine core APIs remain unchanged.

## Approved Commit Comment
build(asset-graph): add additive project asset dependency graph

## Next Command
APPLY_PR_ASSET_DEPENDENCY_GRAPH
