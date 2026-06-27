# PLAN_PR_RUNTIME_ASSET_LOADER

## Goal
Define a strict runtime asset loader and execution model that consumes packaged project output and resolves
runtime-ready assets deterministically without changing engine core APIs.

## Context
The project baseline now includes:
- registry-aware editors
- additive project-level asset dependency graph
- enforced asset validation engine
- assistive remediation system
- strict project packaging/export system

The next architectural layer is runtime execution. This system must load packaged outputs in a predictable,
fail-fast way under the assumption that strict packaging already guaranteed correctness.

## Strict Runtime Intent
This PR is intentionally strict.
Runtime loading should assume packaged data is valid and fail fast when required packaged contracts are violated.

## Scope
- Define packaged-input runtime contracts
- Define runtime manifest consumption rules
- Define deterministic asset load ordering
- Define loader lifecycle states
- Define runtime failure boundaries for invalid packaged input
- Define handoff contract from packaging system to runtime loader

## Non-Goals
- No engine core API changes
- No editor-side packaging redesign
- No defensive missing-asset fallback layer
- No runtime repair/remediation system
- No support for invalid packaged content

## Runtime Inputs
- strict package manifest
- dependency-resolved packaged assets
- stable export layout from packaging system

## Runtime Outputs
- loaded runtime asset table
- resolved startup dependency set
- deterministic loader state/reporting
- runtime-ready project bootstrap data

## Proposed Loader State Model
```json
{
  "runtimeLoader": {
    "status": "idle | loading | ready | failed",
    "loadedAssets": [],
    "failedAt": null,
    "reports": []
  }
}
```

## Core Contracts
1. Runtime loader only accepts strict packaged output as input.
2. Package manifest is the runtime authority for packaged asset enumeration.
3. Load order must be deterministic enough for repeatable startup behavior.
4. Missing or invalid required packaged assets must fail fast.
5. Runtime loader does not repair invalid packages.
6. Registry/graph concepts remain authoring-time sources; packaged manifest is runtime entry authority.
7. Loader reports must be stable and human-readable for debugging.

## Runtime Categories
- manifest ingestion
- package layout validation
- deterministic load sequencing
- startup dependency resolution
- fail-fast boundary reporting
- runtime bootstrap handoff

## Shared Responsibilities
- runtime loading logic should be centralized where practical
- packaged manifest consumption should not be reimplemented ad hoc across samples/tools
- reporting should be stable enough for validation and future automation

## Manual Validation Checklist
1. Valid packaged project loads successfully.
2. Repeated loads of unchanged package produce stable load order.
3. Missing required packaged asset fails fast.
4. Invalid manifest/package contract fails fast.
5. Ready state only occurs after all required startup dependencies resolve.
6. Loader reports clearly identify failure boundaries.
7. Engine core APIs remain unchanged.

## Next Command
BUILD_PR_RUNTIME_ASSET_LOADER
