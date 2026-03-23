Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# PLAN — Game #2: Gravity Well

## Goal
Build a minimal, vector-based game to validate continuous physics using the current engine.

## Core Mechanics
- Ship with thrust
- Gravity sources (planets)
- Velocity + acceleration integration
- Goal target (reach zone)

## Systems
- GravitySystem
- MovementSystem
- CollisionSystem (reuse)
- RenderSystem

## Constraints
- No full physics engine
- Keep math simple and deterministic
- No UI complexity

## Acceptance Criteria
- Ship moves under gravity
- Deterministic motion
- No engine changes required
