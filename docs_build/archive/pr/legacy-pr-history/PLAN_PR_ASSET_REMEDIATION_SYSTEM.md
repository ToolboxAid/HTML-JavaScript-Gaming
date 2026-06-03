# PLAN_PR_ASSET_REMEDIATION_SYSTEM

## Goal
Define an assistive remediation system that sits on top of the enforced asset validation engine and helps users
resolve blocking and non-blocking asset issues without weakening validation guarantees.

## Context
The project baseline now includes:
- registry-aware editors
- additive project-level asset dependency graph
- enforced asset validation engine

Validation can now block guarded operations. The next layer is a remediation system that makes enforcement usable
by surfacing guided actions, suggested repairs, and jump-to-problem workflows.

## Assistive Intent
This PR is intentionally assistive, not auto-fix-first.
The system may suggest and prepare repairs, but user confirmation remains the default control point.

## Scope
- Define shared remediation result and suggestion contracts
- Define mapping from validation findings to remediation opportunities
- Define editor UX responsibilities for assistive repair flows
- Define safe confirmation boundaries for suggested repairs
- Define additive storage/reporting expectations for remediation state where needed

## Non-Goals
- No engine core API changes
- No fully automatic bulk repair system
- No destructive migration of legacy projects
- No replacement of validation engine contracts

## Remediation Categories
- missing asset relink suggestions
- duplicate ID resolution suggestions
- palette reassignment suggestions
- missing tileset/tile/image reference suggestions
- stale graph refresh suggestions
- orphaned asset cleanup suggestions
- jump-to-source navigation for findings

## Proposed Result Model
```json
{
  "remediation": {
    "status": "available | unavailable",
    "actions": [
      {
        "findingCode": "MISSING_ASSET_ID",
        "actionId": "relink-asset",
        "actionType": "suggest | navigate | confirmable-fix",
        "blocking": true,
        "sourceType": "sprite | tilemap | parallaxLayer | registry | graph",
        "sourceId": "example-id",
        "label": "Relink missing asset",
        "message": "Suggested repair explanation"
      }
    ]
  }
}
```

## Core Contracts
1. Validation remains the authority on correctness.
2. Remediation consumes validation output; it does not redefine rule logic.
3. User confirmation is required for state-changing fixes by default.
4. Navigation-only and inspect-only actions remain non-destructive.
5. Legacy projects may surface suggestions immediately after load.
6. Suggested fixes must be deterministic enough for repeatable workflows.
7. Remediation must not bypass enforced save/package/export blocking rules.

## Editor Responsibilities
### Sprite Editor
- Show palette/sprite issue suggestions
- Support jump-to-problem and confirmable relink flows

### Tile Map Editor
- Show missing tileset/tile/sprite issue suggestions
- Support jump-to-problem and confirmable relink/regenerate flows

### Parallax Editor
- Show missing image/layer issue suggestions
- Support jump-to-problem and confirmable relink flows

## Shared Responsibilities
- Centralize suggestion generation where practical
- Keep suggestion labels/messages stable and user-readable
- Preserve deterministic mapping from finding -> available actions
- Keep remediation optional but readily accessible

## Manual Validation Checklist
1. Blocking validation findings surface assistive actions when possible.
2. Confirmable fixes require explicit user confirmation.
3. Navigation actions do not mutate project state.
4. Repeated validation produces stable suggestion sets.
5. Legacy invalid projects can load, inspect, and move toward repair.
6. Enforced blocking still prevents guarded operations until issues are resolved.
7. Engine core APIs remain unchanged.

## Next Command
BUILD_PR_ASSET_REMEDIATION_SYSTEM
