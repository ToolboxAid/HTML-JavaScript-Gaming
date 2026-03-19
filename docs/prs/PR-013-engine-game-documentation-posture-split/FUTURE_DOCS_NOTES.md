PR-013 — future docs notes

### Summary

The compatibility-retained exports now split into two documentation postures:

#### Supported compatibility surfaces
- `GameCollision`
- `GameObjectSystem`
- `GameUtils`

#### Compatibility surfaces with transition-planning note
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectUtils`

### Documentation Direction

#### Supported compatibility surfaces
These should remain visible in docs as currently supported compatibility-facing surfaces.
Their wording should avoid implying that they are deprecated or unstable.

#### Compatibility surfaces with transition-planning note
These should remain documented, but with more cautious wording that:
- preserves compatibility confidence for current callers
- avoids promoting them as preferred future-facing surfaces
- leaves room for later migration guidance

### Guardrail

Documentation posture is not a runtime change.
No wording here should imply immediate removal, hiding, or breakage.
