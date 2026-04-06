Toolbox Aid
David Quesenberry
03/31/2026
BUILD_PR_SAMPLE1201_TILEMAP_VIEWER_IMPLEMENTATION.md

# BUILD_PR_SAMPLE1201_TILEMAP_VIEWER_IMPLEMENTATION

## Goal
Implement `samples/Phase 12 - Sample Games/sample1201-tilemap-viewer/` as the first runnable Phase 12 sample, limited to tilemap viewing only.

## Source Contract
Use `docs/pr/PLAN_PR_SAMPLE1201_TILEMAP_VIEWER_IMPLEMENTATION.md` as the governing plan.
Follow existing working sample conventions already present in the repo.

## Scope
In scope:
- sample1201 runtime wiring
- tilemap load/render
- scene setup for viewer behavior
- camera presence only if needed for correct presentation
- sample-local config/assets references needed to present the map
- README alignment if implementation wording needs minor correction
- `samples/index.html` only if strictly needed for launch correctness

Out of scope:
- hero
- movement
- jump
- collision
- gravity
- parallax
- enemies
- collectibles
- scoring
- menus
- save/load
- reusable engine abstractions unless separately planned

## Expected Result
The sample launches and displays a stable tilemap-focused world view using approved engine contracts only.

## Allowed Diff Area
Primary:
- `samples/Phase 12 - Sample Games/sample1201-tilemap-viewer/**`

Secondary only if required:
- `samples/index.html`

## Disallowed Diff Area
- `engine/**`
- `tools/**`
- `games/**`
- `tests/**`
- other Phase 12 sample folders
- unrelated sample folders

## Validation Gates
- sample1201 launches
- tilemap renders correctly
- sample remains viewer-only
- no hero exists
- no jump/collision/parallax behavior exists
- no diff outside approved paths
- no engine changes
- no tool/test/game changes
- README matches implemented behavior
