PR-008 — boundary notes

### Summary

The current retention labeling splits the verified exports into two groups:

#### Intended public-facing
- `GameObject`
- `GamePlayerSelectUi`

#### Compatibility-retained
- `GameCollision`
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectSystem`
- `GameObjectUtils`
- `GameUtils`

### Architecture Direction

This labeling supports the current `GameBase`-centered direction by:
- keeping a smaller direct game-facing surface
- preserving older or lower-level surfaces for compatibility
- avoiding premature narrowing until later approved PRs

### Safety

This document records retention intent only.
It does not remove, rename, hide, or alter any export.
