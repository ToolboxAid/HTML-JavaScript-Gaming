# BUILD PR: 17.2 Render + Scene Boot (Testable)

## Purpose
Introduce 3D render + scene boot in a non-breaking, validation-first manner.

## Scope
- Add 3D scene boot path (isolated)
- Add render pipeline hook (non-invasive)
- Keep 2D fully intact

## Testability
- 2D samples must still run
- New 3D boot can initialize without crash
- No impact to networking/runtime

## Acceptance
- [ ] Engine boots
- [ ] 2D unaffected
- [ ] 3D scene initializes safely
