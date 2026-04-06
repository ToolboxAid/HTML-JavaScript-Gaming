Toolbox Aid
David Quesenberry
03/31/2026
BUILD_PR_SAMPLE1203_TILEMAP_HERO_JUMP_COLLISION_IMPLEMENTATION.md

# BUILD_PR_SAMPLE1203_TILEMAP_HERO_JUMP_COLLISION_IMPLEMENTATION

## Goal
Implement `samples/Phase 12 - Sample Games/sample1203-tilemap-hero-jump-collision/` as a runnable Phase 12 sample that adds jump, gravity, grounded behavior, and tile/platform collision on top of a scrolling hero traversal pattern.

## Source Contract
Use `docs/pr/PLAN_PR_SAMPLE1203_TILEMAP_HERO_JUMP_COLLISION_IMPLEMENTATION.md` as the governing plan.
Follow existing working sample conventions already present in the repo.

## Scope
In scope:
- sample1203 runtime wiring
- visible hero
- left/right movement
- jump
- gravity
- grounded state behavior
- tile/platform collision
- camera follow behavior
- large tilemap sufficient for visible scrolling during normal play
- sample-local assets/config needed for hero/platform interaction
- README alignment if implementation wording needs minor correction
- `samples/index.html` only if strictly needed for launch correctness

Out of scope:
- parallax
- enemies
- collectibles
- score systems
- combat/actions
- menus
- save/load
- advanced animation systems unless already simple and local
- reusable engine abstractions unless separately planned

## Hero Contract
Required controls:
- Left Arrow = move left
- Right Arrow = move right
- Space = jump

Explicitly not included:
- attack/actions
- crouch/down behavior
- secondary abilities
- wall jump
- double jump
- dash
- climb

## Physics / Movement Contract
Required:
- horizontal movement
- jump impulse
- gravity
- grounded vs airborne behavior
- landing behavior
- tile/platform collision that prevents normal fall-through and normal pass-through

Not required:
- slopes
- ladders
- moving platforms
- one-way platform complexity unless already trivially supported
- advanced friction tuning
- production-grade platform physics

## Collision Contract
Required:
- hero does not fall through ground in normal use
- hero does not pass through solid blocking tiles in normal use
- landing on walkable surfaces behaves consistently

## Camera Contract
- camera follows hero in a stable, readable way
- horizontal follow is required
- vertical follow only if needed and already cleanly supported
- vertical fixed camera is acceptable if that keeps scope simpler
- camera clamping to map bounds is allowed

## Map Size Requirement
- tilemap must be larger than the visible viewport
- normal use must visibly demonstrate horizontal traversal, jump opportunities, terrain/platform variation, and scrolling during play

## Expected Result
The sample launches, shows a visible hero, supports left/right movement and Space-to-jump, applies gravity, lands on valid surfaces, collides with the tilemap/platforms in normal play, and scrolls visibly in a larger-than-viewport world.

## Allowed Diff Area
Primary:
- `samples/Phase 12 - Sample Games/sample1203-tilemap-hero-jump-collision/**`

Secondary only if required:
- `samples/index.html`

## Disallowed Diff Area
- `engine/**`
- `tools/**`
- `games/**`
- `tests/**`
- `samples/Phase 12 - Sample Games/sample1201-tilemap-viewer/**`
- `samples/Phase 12 - Sample Games/sample1202-tilemap-hero-movement/**`
- other Phase 12 sample folders
- unrelated sample folders

## Validation Gates
- sample1203 launches
- hero is visible
- hero moves left/right
- hero jumps with Space
- gravity is active
- grounded/landing behavior exists
- collision with ground/platform tiles works in normal play
- camera follows cleanly
- tilemap is larger than viewport
- visible scrolling occurs during normal play
- no parallax exists
- no enemy/collectible/game systems exist
- no diff outside approved paths
- no engine changes
- no tool/test/game changes
- README matches implemented behavior
