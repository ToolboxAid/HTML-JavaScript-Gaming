# BUILD PR: 17.4 Movement + Collision Base (3D)

## Purpose
Introduce minimal 3D movement and collision primitives.

## Scope
- Basic position update (velocity integration)
- Simple collision bounds (AABB or sphere)
- No physics engine yet (foundation only)

## Testability
- 2D systems remain unaffected
- 3D entities can move and collide in isolation

## Acceptance
- [ ] Movement updates correctly
- [ ] Collision detection triggers
- [ ] No regression in 2D or networking
