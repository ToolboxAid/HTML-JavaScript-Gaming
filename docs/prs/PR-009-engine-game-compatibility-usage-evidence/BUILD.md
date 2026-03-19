PR-009 — engine/game compatibility usage evidence build

### Purpose

This BUILD_PR records a docs-only framework for gathering usage evidence for the verified
compatibility-retained `engine/game` exports.

### Verified Baseline

This build uses the verified PR-008 compatibility-retained export baseline:
- `GameCollision`
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectSystem`
- `GameObjectUtils`
- `GameUtils`

### What This BUILD_PR Does

- defines the docs-only evidence-gathering structure
- records caller categories and evidence rules
- prepares a usage matrix for verified caller references
- keeps the work docs-only
- preserves compatibility and current execution paths

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
- does not remove or rename exports
