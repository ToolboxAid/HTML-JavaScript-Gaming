MODEL: GPT-5.3-codex
REASONING: high

BUILD_PR_SAMPLE1202_TILEMAP_HERO_MOVEMENT_IMPLEMENTATION

Use `docs/pr/PLAN_PR_SAMPLE1202_TILEMAP_HERO_MOVEMENT_IMPLEMENTATION.md` as the source contract.
Follow the existing working sample structure pattern already used in this repo.

THIS IS A MANDATORY CHANGE.
A NO-OP RESULT IS INVALID.

SCOPE
- Implement only enough runtime for visible hero movement across a larger-than-viewport tilemap
- Keep this sample limited to left/right traversal only
- Stay inside existing engine contracts
- Do not add jump, collision-as-feature, or parallax

MAP SIZE REQUIREMENT
- The tilemap must be larger than the visible viewport
- Normal traversal must produce clear camera/world scrolling
- Layout should make horizontal traversal visually obvious

HERO CONTRACT
- Left Arrow = move left
- Right Arrow = move right
- Visible hero required
- No jump
- No Up Arrow gameplay
- No Down Arrow gameplay
- No attack/actions

CAMERA CONTRACT
- Camera must follow hero horizontally in a stable, readable way
- Vertical camera may remain fixed if that keeps scope simple
- Clamp to map bounds if already cleanly supported

ALLOWED CHANGES
Primary:
- samples/Phase 12 - Sample Games/sample1202-tilemap-hero-movement/**

Secondary only if strictly required for launch correctness:
- samples/index.html

REQUIRED WORK
1. Implement sample1202 using repo-consistent sample structure
2. Wire the sample so it launches cleanly
3. Add a visible hero
4. Implement left/right movement only using approved input services
5. Load and render a tilemap larger than the viewport
6. Add clean horizontal camera follow
7. Keep README.md accurate to actual implemented behavior
8. Update samples/index.html only if strictly required for launch correctness

BLOCKED FEATURES
- jump
- gravity/platforming behavior
- collision as a featured mechanic
- parallax
- enemies
- collectibles
- scoring
- menus
- save/load
- reusable engine abstractions
- engine changes unless separately planned and approved

VALIDATION (FAIL IF NOT TRUE)
- sample1202 launches
- hero is visible
- hero moves left/right only
- camera follows hero cleanly
- tilemap is larger than the viewport
- visible scrolling occurs during normal traversal
- no jump exists
- no gravity/platforming behavior exists
- no parallax exists
- no diff outside:
  - samples/Phase 12 - Sample Games/sample1202-tilemap-hero-movement/**
  - samples/index.html (only if needed)
- no engine/tools/tests/games changes
- README matches actual behavior

COMMIT MESSAGE
BUILD_PR: implement sample1202 hero movement with camera follow

- add runnable sample1202 tilemap hero movement sample
- implement visible hero with left/right traversal only
- add horizontal camera follow across a larger-than-viewport tilemap
- keep scope tight (no jump, no gravity/platforming, no parallax)
- no engine, tools, tests, or games changes

OUTPUT CONTRACT (MANDATORY)
- Produce a repo-structured delta ZIP
- Output path:
  <project folder>/tmp/BUILD_PR_SAMPLE1202_TILEMAP_HERO_MOVEMENT_IMPLEMENTATION_delta.zip
- ZIP must contain only changed/added files for this BUILD_PR
- ZIP must not be empty
