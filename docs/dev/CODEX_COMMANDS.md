MODEL: GPT-5.3-codex
REASONING: high

BUILD_PR_SAMPLE1203_TILEMAP_HERO_JUMP_COLLISION_IMPLEMENTATION

Use `docs/pr/PLAN_PR_SAMPLE1203_TILEMAP_HERO_JUMP_COLLISION_IMPLEMENTATION.md` as the source contract.
Follow the existing working sample structure pattern already used in this repo.

THIS IS A MANDATORY CHANGE.
A NO-OP RESULT IS INVALID.

SCOPE
- Implement only enough runtime for jump/collision platform interaction in a larger-than-viewport scrolling world
- Keep the sample focused on hero movement, jump, gravity, grounded state, and tile/platform collision
- Stay inside existing engine contracts
- Do not add parallax or broader gameplay systems

MAP SIZE REQUIREMENT
- The tilemap must be larger than the visible viewport
- Normal play must produce clear camera/world scrolling
- Layout must make traversal and jump opportunities visually obvious

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

PHYSICS / MOVEMENT CONTRACT
- Add horizontal movement
- Add jump impulse
- Add gravity
- Add grounded vs airborne behavior
- Add landing behavior
- Collision must prevent normal fall-through and normal pass-through

CAMERA CONTRACT
- Camera must follow hero in a stable, readable way
- Horizontal follow required
- Vertical follow only if needed and already cleanly supported
- Vertical fixed camera is acceptable if simpler
- Clamp to map bounds if already cleanly supported

ALLOWED CHANGES
Primary:
- samples/Phase 12 - Sample Games/sample1203-tilemap-hero-jump-collision/**

Secondary only if strictly required for launch correctness:
- samples/index.html

REQUIRED WORK
1. Implement sample1203 using repo-consistent sample structure
2. Wire the sample so it launches cleanly
3. Add a visible hero
4. Implement left/right movement using approved input services
5. Implement Space-to-jump
6. Implement gravity and grounded behavior
7. Implement tile/platform collision sufficient for normal play
8. Load and render a tilemap larger than the viewport
9. Add clean camera follow during play
10. Keep README.md accurate to actual implemented behavior
11. Update samples/index.html only if strictly required for launch correctness

BLOCKED FEATURES
- parallax
- enemies
- collectibles
- score/progression systems
- combat/actions
- menus
- save/load
- advanced animation systems unless already simple and local
- reusable engine abstractions
- engine changes unless separately planned and approved

VALIDATION (FAIL IF NOT TRUE)
- sample1203 launches
- hero is visible
- hero moves left/right
- hero jumps with Space
- gravity is active
- grounded/landing behavior exists
- collision with ground/platform tiles works in normal play
- camera follows cleanly
- tilemap is larger than the viewport
- visible scrolling occurs during normal play
- no parallax exists
- no enemy/collectible/game systems exist
- no diff outside:
  - samples/Phase 12 - Sample Games/sample1203-tilemap-hero-jump-collision/**
  - samples/index.html (only if needed)
- no engine/tools/tests/games changes
- README matches actual behavior

COMMIT MESSAGE
BUILD_PR: implement sample1203 hero jump and collision

- add runnable sample1203 platform interaction sample
- implement visible hero with left/right movement and Space-to-jump
- add gravity, grounded behavior, and tile/platform collision
- keep scrolling world larger than viewport with stable camera follow
- keep scope tight (no parallax, no enemies, no broader game systems)
- no engine, tools, tests, or games changes

OUTPUT CONTRACT (MANDATORY)
- Produce a repo-structured delta ZIP
- Output path:
  <project folder>/tmp/BUILD_PR_SAMPLE1203_TILEMAP_HERO_JUMP_COLLISION_IMPLEMENTATION_delta.zip
- ZIP must contain only changed/added files for this BUILD_PR
- ZIP must not be empty
