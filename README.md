Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Engine Boundary Cleanup Step 2D (EventBus Naming + Ownership)

## Purpose
Implement the next surgical Step 2 follow-up by normalizing EventBus casing and protecting cross-platform portability.

## Goal
Resolve `eventBus.js` vs `EventBus.js` casing drift so imports are portable across case-sensitive filesystems, while preserving EventBus as an engine-owned injected service.

## Scope
- `engine/events/EventBus.js`
- direct imports/usages of EventBus
- focused tests or validation for portability/ownership
- `tests/run-tests.mjs` only if required

## Constraints
- No gameplay changes
- No timing/fullscreen/canvas work in this PR
- Do not convert EventBus into a process-global singleton
- Preserve current EventBus behavior and ownership model

## Expected Outcome
- Import casing is normalized to `EventBus.js`
- cross-platform case drift risk is removed
- EventBus remains injectable and engine-owned
