MODEL: GPT-5.3-codex
REASONING: high

BUILD_PR_SAMPLE1204_TILEMAP_PARALLAX_HERO_IMPLEMENTATION

Use `docs/pr/PLAN_PR_SAMPLE1204_TILEMAP_PARALLAX_HERO_IMPLEMENTATION.md` as the source contract.
Follow the existing working sample structure pattern already used in this repo.

THIS IS A MANDATORY CHANGE.
A NO-OP RESULT IS INVALID.

SCOPE
- Implement only enough runtime to add parallax background depth on top of the already-proven hero movement/jump/collision sample pattern
- Preserve the proven gameplay contract from sample1203
- Stay inside existing engine contracts
- Do not add broader gameplay systems

CORE RULE
- Do not change the gameplay contract already proven in sample1203
- The only major new concept in this PR is layered parallax depth

MAP SIZE REQUIREMENT
- The tilemap must be larger than the visible viewport
- Normal play must produce clear camera/world scrolling
- Layout must make traversal, jump opportunities, and parallax depth visually obvious

HERO CONTRACT
- Left Arrow = move left
- Right Arrow = move right
- Space = jump
- Visible hero required
- No attack/actions
- No crouch/down gameplay
- No wall jump
- No double jump
- No dash
- No climb

PARALLAX CONTRACT
- Add at least one background parallax layer
- Prefer multiple layers if clean and sample-local
- Layers must move relative to camera movement
- Farther layers must move more slowly than nearer layers
- Parallax must be clearly visible during normal play
- Background-only parallax is preferred
- Optional foreground layer only if simple and non-disruptive

CAMERA CONTRACT
- Camera must follow hero in a stable, readable way
- Horizontal follow required
- Vertical fixed camera is acceptable if simpler
- Vertical follow only if already cleanly supported
- Clamp to map bounds if already cleanly supported

ALLOWED CHANGES
Primary:
- samples/Phase 12 - Sample Games/sample1204-tilemap-parallax-hero/**

Secondary only if strictly required for launch correctness:
- samples/index.html

REQUIRED WORK
1. Implement sample1204 using repo-consistent sample structure
2. Wire the sample so it launches cleanly
3. Add a visible hero
4. Implement left/right movement and Space-to-jump using approved input services
5. Preserve gravity, grounded behavior, and tile/platform collision for normal play
6. Load and render a tilemap larger than the viewport
7. Add clearly visible parallax background layer(s)
8. Ensure farther layers move slower than nearer layers
9. Keep camera follow stable during play
10. Keep README.md accurate to actual implemented behavior
11. Update samples/index.html only if strictly required for launch correctness

BLOCKED FEATURES
- enemies
- collectibles
- score/progression systems
- combat/actions
- menus
- save/load
- advanced game rules
- new hero abilities
- reusable engine abstractions
- engine changes unless separately planned and approved

VALIDATION (FAIL IF NOT TRUE)
- sample1204 launches
- hero is visible
- hero moves left/right
- hero jumps with Space
- gravity is active
- grounded/landing behavior exists
- collision with ground/platform tiles works in normal play
- camera follows cleanly
- tilemap is larger than the viewport
- visible scrolling occurs during normal play
- parallax is clearly visible
- farther layers move slower than nearer layers
- no enemy/collectible/game systems exist
- no diff outside:
  - samples/Phase 12 - Sample Games/sample1204-tilemap-parallax-hero/**
  - samples/index.html (only if needed)
- no engine/tools/tests/games changes
- README matches actual behavior

COMMIT MESSAGE
BUILD_PR: implement sample1204 parallax hero sample

- add runnable sample1204 parallax hero sample
- preserve proven hero movement, jump, gravity, and collision behavior
- add clearly visible background parallax depth with layered camera-relative motion
- keep scrolling world larger than viewport with stable camera follow
- keep scope tight (no enemies, no collectibles, no broader game systems)
- no engine, tools, tests, or games changes

OUTPUT CONTRACT (MANDATORY)
- Produce a repo-structured delta ZIP
- Output path:
  <project folder>/tmp/BUILD_PR_SAMPLE1204_TILEMAP_PARALLAX_HERO_IMPLEMENTATION_delta.zip
- ZIP must contain only changed/added files for this BUILD_PR
- ZIP must not be empty
