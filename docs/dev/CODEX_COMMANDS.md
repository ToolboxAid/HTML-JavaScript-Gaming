MODEL: GPT-5.3-codex
REASONING: high

BUILD_PR_SAMPLE1201_TILEMAP_VIEWER_IMPLEMENTATION

Use `docs/pr/PLAN_PR_SAMPLE1201_TILEMAP_VIEWER_IMPLEMENTATION.md` as the source contract.
Follow the existing working sample structure pattern already used in this repo.

THIS IS A MANDATORY CHANGE.
A NO-OP RESULT IS INVALID.

SCOPE
- Implement only enough runtime to launch and display the tilemap
- Keep this sample viewer-only
- Stay inside existing engine contracts
- Do not add hero/gameplay features

ALLOWED CHANGES
Primary:
- samples/Phase 12 - Sample Games/sample1201-tilemap-viewer/**

Secondary only if strictly required for launch correctness:
- samples/index.html

REQUIRED WORK
1. Implement sample1201 using repo-consistent sample structure
2. Wire the sample so it launches cleanly
3. Load and render a tilemap
4. Initialize camera only if needed for correct map presentation
5. Keep README.md accurate to actual implemented behavior
6. Update samples/index.html only if strictly required for launch correctness

BLOCKED FEATURES
- hero
- left/right movement
- jump
- collision as a feature
- gravity/platforming behavior
- parallax
- enemies
- collectibles
- menus
- save/load
- reusable engine abstractions
- engine changes unless separately planned and approved

VALIDATION (FAIL IF NOT TRUE)
- sample1201 launches
- tilemap is visible and stable
- no hero exists
- no jump/collision/parallax behavior exists
- no diff outside:
  - samples/Phase 12 - Sample Games/sample1201-tilemap-viewer/**
  - samples/index.html (only if needed)
- no engine/tools/tests/games changes
- README matches actual behavior

OUTPUT CONTRACT (MANDATORY)
- Produce a repo-structured delta ZIP
- Output path:
  <project folder>/tmp/BUILD_PR_SAMPLE1201_TILEMAP_VIEWER_IMPLEMENTATION_delta.zip
- ZIP must contain only changed/added files for this BUILD_PR
- ZIP must not be empty
