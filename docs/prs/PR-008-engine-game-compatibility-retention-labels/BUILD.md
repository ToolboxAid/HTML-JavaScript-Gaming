PR-008 — engine/game compatibility retention labels build

### Purpose

This BUILD_PR records a docs-only retention labeling of the verified `engine/game` exports
that were classified in PR-007.

### Verified Baseline

This build uses the verified PR-007 classification baseline:
- public: `GameObject`, `GamePlayerSelectUi`
- internal: `GameCollision`, `GameObjectManager`, `GameObjectRegistry`, `GameObjectSystem`
- transitional: `GameObjectUtils`, `GameUtils`

### What This BUILD_PR Does

- labels each verified export as intended public-facing or compatibility-retained
- records concise retention rationale for each label
- keeps the work docs-only
- preserves compatibility and current execution paths

### What This BUILD_PR Does Not Do

- does not change runtime behavior
- does not change imports
- does not move files
- does not alter execution paths
- does not delete files
- does not remove or rename exports
