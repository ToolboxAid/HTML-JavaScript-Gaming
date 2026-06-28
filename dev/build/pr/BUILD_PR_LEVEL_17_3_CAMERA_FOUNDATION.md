# BUILD PR: 17.3 Camera Foundation (3D Safe Introduction)

## Purpose
Introduce a minimal 3D camera system without impacting 2D camera.

## Scope
- Add 3D camera model (position, rotation)
- Non-invasive integration point
- No modification to 2D camera

## Testability
- 2D camera unaffected
- 3D camera can initialize and update safely

## Acceptance
- [ ] Engine boot passes
- [ ] 2D camera unchanged
- [ ] 3D camera initializes and updates
