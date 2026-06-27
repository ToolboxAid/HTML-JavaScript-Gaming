# BUILD PR — Level 11.1 Authoritative Handoff Validation Tighten

## Purpose
Enforce strict finite numeric validation at transition boundary to prevent NaN / Infinity drift.

## Scope
- Validation only
- No API changes
- No state shape changes

## File
- src/advanced/state/transitions.js

## Changes
- Normalize numeric inputs using Number()
- Enforce Number.isFinite checks
- Improve validation error clarity

## Exact file edits
### validateApplyScoreDelta
Replace inline numeric check with:
- `const normalizedDelta = Number(payload.delta);`
- `Number.isFinite(normalizedDelta)`
- reason text: `applyScoreDelta requires finite numeric payload.delta.`

### validateAdvanceWave
Keep logic unchanged except reason text becomes:
- `advanceWave requires finite amount > 0.`

### validateUpdateObjectiveProgress
Replace inline `Number(...)` finite checks with explicit normalized locals:
- `normalizedCurrent`
- `normalizedTarget`

Enforce:
- `updateObjectiveProgress payload.currentValue must be finite numeric when provided.`
- `updateObjectiveProgress payload.targetValue must be finite numeric when provided.`

## Validation
- Existing tests pass
- Invalid numeric payloads rejected
- Valid numeric payloads accepted

## Risk
Low (validation only)
