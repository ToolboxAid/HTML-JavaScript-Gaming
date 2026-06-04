# PLAN_PR_ASSET_VALIDATION_ENGINE

## Goal
Define a project-level asset validation engine that enforces dependency and registry correctness for authoring workflows,
with deterministic validation outcomes and explicit failure rules for invalid projects.

## Context
The project baseline now includes:
- registry-aware Sprite Editor
- registry-aware Tile Map Editor
- registry-aware Parallax Editor
- additive project-level asset dependency graph

The next architectural layer is an enforced validation engine that determines whether project state is valid enough
to save, package, or export under defined project rules.

## Enforced Mode Intent
This PR is intentionally **enforced**, not passive.
Validation findings are allowed to block save/package/export operations where contracts are violated.

## Scope
- Define shared validation engine contracts
- Define validation result model
- Define severity levels and blocking rules
- Define editor integration expectations
- Define registry + dependency graph validation categories
- Define backward-compatible rollout behavior for legacy projects

## Non-Goals
- No engine core API changes
- No runtime gameplay validator
- No packaging/export implementation beyond validation gates
- No destructive migration of legacy projects

## Validation Categories
- missing asset ID references
- orphaned graph nodes
- invalid edge targets
- duplicate IDs in registry-owned domains
- illegal circular dependencies where disallowed
- unresolved palette relationships
- unresolved tileset/tile/image dependencies
- stale graph snapshots versus registry source data

## Proposed Result Model
```json
{
  "validation": {
    "status": "valid | invalid",
    "findings": [
      {
        "code": "MISSING_ASSET_ID",
        "severity": "error | warning | info",
        "blocking": true,
        "sourceType": "sprite | tilemap | parallaxLayer | registry | graph",
        "sourceId": "example-id",
        "message": "Human-readable explanation"
      }
    ]
  }
}
```

## Severity Contract
- `error` = blocking in enforced mode
- `warning` = non-blocking but visible
- `info` = advisory only

## Blocking Rules
The following must block guarded operations in enforced mode:
1. missing required asset IDs
2. invalid dependency graph targets
3. duplicate authoritative IDs
4. illegal circular dependencies
5. unresolved required palette/tileset/image links
6. registry/graph corruption that prevents deterministic reconstruction

## Allowed Operations Under Enforcement
- read/load legacy content
- inspect project state
- edit toward remediation
- run validation repeatedly

## Blocked Operations Under Enforcement
- save invalid guarded project state when blocking findings exist
- package/export invalid project state
- finalize derived artifacts from invalid source state

## Legacy Compatibility
- Legacy projects without validation data must still load
- Validation may immediately flag legacy issues after load
- Editors must permit remediation workflows even when save/package/export are blocked
- BUILD should prefer additive validation metadata, not migration requirements

## Editor Responsibilities
### Sprite Editor
- surface palette and sprite reference failures
- block guarded save/finalize actions on blocking findings

### Tile Map Editor
- surface missing tileset/tile/sprite dependencies
- block guarded save/finalize actions on blocking findings

### Parallax Editor
- surface missing image/layer dependencies
- block guarded save/finalize actions on blocking findings

## Shared Responsibilities
- validation logic should be centralized in shared tooling where practical
- editors should consume validation results, not reinvent rule logic
- result formatting should be stable enough for reports and future tooling

## Manual Validation Checklist
1. Valid registry-aware project passes with no blocking findings.
2. Missing required asset ID fails validation deterministically.
3. Duplicate authoritative IDs fail validation deterministically.
4. Illegal cycle detection produces blocking findings.
5. Legacy project loads, surfaces issues, and allows remediation.
6. Blocked operations remain blocked until findings are resolved.
7. Non-blocking warnings do not prevent remediation workflows.
8. Engine core APIs remain unchanged.

## Next Command
BUILD_PR_ASSET_VALIDATION_ENGINE
