PR-007 — boundary alignment notes

### Alignment Summary

The verified `engine/game` exports split naturally into three architectural groups:

#### Public candidates
- `GameObject`
- `GamePlayerSelectUi`

These are the strongest candidates for direct game-facing use based on current naming and repo direction.

#### Internal candidates
- `GameCollision`
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectSystem`

These names read primarily as orchestration, bookkeeping, or engine-plumbing concerns.

#### Transitional candidates
- `GameObjectUtils`
- `GameUtils`

These names are broad and compatibility-prone, so they should remain exposed for now but should not expand in scope.

### GameBase Direction

This classification supports the current architecture goal of narrowing direct game-facing API toward clearer, higher-level surfaces while pushing orchestration and plumbing behind the boundary.

### Safety

This document is classification only.
It does not remove or rename exports, and it does not change runtime behavior.
