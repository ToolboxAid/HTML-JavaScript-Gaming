Toolbox Aid
David Quesenberry
03/31/2026
BUILD_PR_SAMPLE1204_TILEMAP_PARALLAX_HERO_IMPLEMENTATION.md

# BUILD_PR_SAMPLE1204_TILEMAP_PARALLAX_HERO_IMPLEMENTATION

## Goal
Implement `samples/Phase 12 - Sample Games/sample1204-tilemap-parallax-hero/` as a runnable Phase 12 sample that adds parallax background depth on top of already proven hero movement, jump, gravity, collision, and scrolling world behavior.

## Source Contract
Use `docs/pr/PLAN_PR_SAMPLE1204_TILEMAP_PARALLAX_HERO_IMPLEMENTATION.md` as the governing plan.
Follow existing working sample conventions already present in the repo.

## Scope
In scope:
- sample1204 runtime wiring
- visible hero
- left/right movement
- jump
- gravity
- grounded state behavior
- tile/platform collision
- camera follow behavior
- parallax background layers
- large tilemap sufficient for visible scrolling during normal play
- sample-local assets/config needed for parallax + hero interaction
- README alignment if implementation wording needs minor correction
- `samples/index.html` only if strictly needed for launch correctness

Out of scope:
- enemies
- collectibles
- score systems
- combat/actions
- menus
- save/load
- advanced game rules
- reusable engine abstractions unless separately planned
- new gameplay mechanics beyond already-proven 1203 behavior

## Core Rule
Do not change the gameplay contract already proven in sample1203.
The only major new concept in this PR is layered parallax depth.

## Hero Contract
Required controls:
- Left Arrow = move left
- Right Arrow = move right
- Space = jump

Explicitly not included:
- attack/actions
- crouch/down behavior
- wall jump
- double jump
- dash
- climb
- new hero abilities

## Parallax Contract
Required:
- at least one background parallax layer
- preferably multiple layers if clean and sample-local
- layers move relative to camera movement
- farther layers move more slowly than nearer layers
- parallax must be visually obvious during normal play

Allowed:
- simple colored layers
- sample-local generated layers
- image-based layers if consistent with repo sample conventions
- background-only parallax
- optional foreground layer only if already simple and does not interfere with readability

Not required:
- weather effects
- particle systems
- animated backgrounds
- procedural world systems
- dynamic lighting

## Camera Contract
- camera follows hero in a stable, readable way
- horizontal follow is required
- vertical fixed camera is acceptable if that keeps the sample simpler
- vertical follow only if already cleanly supported
- camera clamping to map bounds is allowed

## Map Size Requirement
- tilemap must be larger than the visible viewport
- normal use must visibly demonstrate horizontal traversal, jump opportunities, platform variation, scrolling during play, and clearly visible parallax depth

## Expected Result
The sample launches, shows a visible hero, preserves proven platform interaction behavior, and adds clearly visible background parallax depth where farther layers move more slowly than nearer layers during camera movement.

## Allowed Diff Area
Primary:
- `samples/Phase 12 - Sample Games/sample1204-tilemap-parallax-hero/**`

Secondary only if required:
- `samples/index.html`

## Disallowed Diff Area
- `engine/**`
- `tools/**`
- `games/**`
- `tests/**`
- `samples/Phase 12 - Sample Games/sample1201-tilemap-viewer/**`
- `samples/Phase 12 - Sample Games/sample1202-tilemap-hero-movement/**`
- `samples/Phase 12 - Sample Games/sample1203-tilemap-hero-jump-collision/**`
- other Phase 12 sample folders
- unrelated sample folders

## Validation Gates
- sample1204 launches
- hero is visible
- hero moves left/right
- hero jumps with Space
- gravity is active
- grounded/landing behavior exists
- collision with ground/platform tiles works in normal play
- camera follows cleanly
- tilemap is larger than viewport
- visible scrolling occurs during normal play
- parallax is clearly visible
- farther layers move slower than nearer layers
- no enemy/collectible/game systems exist
- no diff outside approved paths
- no engine changes
- no tool/test/game changes
- README matches implemented behavior
