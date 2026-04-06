# PLAN_PR_PROJECT_PACKAGING_SYSTEM

## Goal
Define a strict project packaging and export system that converts validated project content into deterministic,
dependency-resolved output packages without changing engine core APIs.

## Context
The project baseline now includes:
- registry-aware editors
- additive project-level asset dependency graph
- enforced asset validation engine
- assistive remediation system

The next architectural layer is packaging. This system must turn a valid project into a predictable export artifact
while refusing to package invalid guarded project state.

## Strict Intent
This PR is intentionally strict.
Packaging and export must be blocked whenever blocking validation findings exist.

## Scope
- Define shared packaging contracts
- Define package manifest structure
- Define dependency collection rules
- Define validation gate requirements for export
- Define deterministic packaging expectations
- Define backward-compatible handling for legacy content that can be validated and resolved

## Non-Goals
- No engine core API changes
- No runtime loader redesign
- No bypass for blocking validation findings
- No destructive migration of legacy projects

## Packaging Inputs
- project asset registry
- project asset dependency graph
- enforced validation results
- accepted editor-owned project data

## Packaging Outputs
- package manifest
- dependency-resolved asset list
- deterministic export directory or archive layout
- validation-gated status reporting
- packaging report suitable for future tooling

## Proposed Manifest Shape
```json
{
  "package": {
    "version": 1,
    "projectId": "example-project",
    "createdFrom": {
      "registryVersion": 1,
      "graphVersion": 1
    },
    "assets": [],
    "dependencies": [],
    "reports": []
  }
}
```

## Core Contracts
1. Validation must pass with no blocking findings before guarded packaging/export can proceed.
2. Registry remains source of truth for asset identity.
3. Dependency graph remains the relational source for traversal and dependency collection.
4. Packaging output must be deterministic enough to reduce diff noise for unchanged inputs.
5. Missing or invalid dependencies must block strict packaging.
6. Legacy content may package only after it validates and resolves under current rules.
7. Packaging reports must be readable and stable for future automation.

## Packaging Categories
- manifest generation
- dependency collection
- asset inclusion planning
- path/layout normalization
- validation gate enforcement
- export reporting
- repeatable output ordering

## Editor Responsibilities
### Sprite Editor
- expose registry-valid sprite/palette content for packaging

### Tile Map Editor
- expose registry-valid tile and map content for packaging

### Parallax Editor
- expose registry-valid parallax/image content for packaging

## Shared Responsibilities
- packaging logic should be centralized where practical
- editors should provide project data, not duplicate packaging logic
- manifests and reports should remain stable and deterministic

## Manual Validation Checklist
1. Valid project packages successfully.
2. Project with blocking validation findings cannot package.
3. Dependency collection matches registry + graph state.
4. Repeated packaging of unchanged project produces stable output ordering.
5. Missing dependency blocks packaging.
6. Packaging reports clearly identify success/failure reasons.
7. Engine core APIs remain unchanged.

## Next Command
BUILD_PR_PROJECT_PACKAGING_SYSTEM
