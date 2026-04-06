Toolbox Aid
David Quesenberry
03/31/2026
BUILD_PR_SAMPLE1202_TILEMAP_HERO_MOVEMENT_IMPLEMENTATION.md

# BUILD_PR_SAMPLE1202_TILEMAP_HERO_MOVEMENT_IMPLEMENTATION

## Goal
Implement `samples/Phase 12 - Sample Games/sample1202-tilemap-hero-movement/` as a runnable Phase 12 sample that adds a lightweight hero with left/right traversal across a large scrolling tilemap world.

## Source Contract
Use `docs/pr/PLAN_PR_SAMPLE1202_TILEMAP_HERO_MOVEMENT_IMPLEMENTATION.md` as the governing plan.
Follow existing working sample conventions already present in the repo.

## Scope
In scope:
- sample1202 runtime wiring
- hero entity or hero presentation layer
- left/right movement only
- camera follow behavior
- large tilemap sufficient for visible scrolling during traversal
- sample-local assets/config needed for hero display and movement
- README alignment if implementation wording needs minor correction
- `samples/index.html` only if strictly needed for launch correctness

Out of scope:
- jump
- gravity
- collision resolution as a featured mechanic
- platform interaction
- parallax
- enemies
- collectibles
- scoring
- menus
- save/load
- reusable engine abstractions unless separately planned

## Hero Contract
- Left Arrow = move left
- Right Arrow = move right

Explicitly not included:
- jump
- Up Arrow gameplay
- Down Arrow gameplay
- attack/actions
- collision-based mechanics as a focus

## Camera Contract
- Camera follows hero horizontally in a stable, readable way
- Vertical camera may remain fixed if that keeps scope simple
- Clamping to map bounds is allowed if already cleanly supported

## Map Size Requirement
- The tilemap must be larger than the visible viewport
- Normal traversal must produce clear camera/world scrolling
- Layout should make horizontal traversal visually obvious

## Expected Result
The sample launches, shows a visible hero, supports left/right traversal only, and demonstrates clean camera-follow scrolling across a larger-than-viewport tilemap.

## Allowed Diff Area
Primary:
- `samples/Phase 12 - Sample Games/sample1202-tilemap-hero-movement/**`

Secondary only if required:
- `samples/index.html`

## Disallowed Diff Area
- `engine/**`
- `tools/**`
- `games/**`
- `tests/**`
- `samples/Phase 12 - Sample Games/sample1201-tilemap-viewer/**`
- other Phase 12 sample folders
- unrelated sample folders

## Validation Gates
- sample1202 launches
- hero is visible
- hero moves left/right only
- camera follows hero cleanly
- tilemap is larger than viewport
- visible scrolling occurs during normal traversal
- no jump exists
- no gravity/platforming behavior exists
- no parallax exists
- no diff outside approved paths
- no engine changes
- no tool/test/game changes
- README matches implemented behavior
