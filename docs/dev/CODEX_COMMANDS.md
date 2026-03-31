MODEL: GPT-5.3-codex
REASONING: high

BUILD_PR_DEMO1206_TRIGGER_ZONE

Use the existing Phase 12 Demo progression as the source contract.

THIS IS A MANDATORY CHANGE.
A NO-OP RESULT IS INVALID.

SCOPE
Implement Demo 1206 - Trigger Zone as an integrated demo using:
- tilemap
- hero movement
- jump
- gravity
- collision
- camera follow
- parallax

Add exactly one light interaction layer:
- trigger zone success state

DEMO CONTRACT
- preserve the proven runtime behavior pattern from Demo 1204/1205
- do not redesign gameplay or camera behavior
- the only major new concept is trigger zone interaction
- world must remain larger than the viewport
- scrolling must remain clearly visible

REQUIRED WORK
1. Implement Demo 1206 using repo-consistent demo structure
2. Add a visible hero
3. Preserve:
   - Left Arrow = move left
   - Right Arrow = move right
   - Space = jump
4. Preserve gravity, grounded behavior, collision, camera follow, and parallax
5. Add one visible goal/trigger zone in the world
6. When hero enters the trigger zone:
   - success state/message is displayed
7. Keep the success behavior sample-local and simple
8. Keep README.md accurate
9. Update samples/index.html only if strictly required for launch correctness

ALLOWED CHANGES
Primary:
- samples/Phase 12 - Demo Games/Demo 1206 - Trigger Zone/**

Secondary only if strictly required:
- samples/index.html

BLOCKED FEATURES
- collectible counter
- switch/checkpoint behavior
- enemies
- combat
- inventory
- menus
- save/load
- broader gameplay systems
- engine changes
- non-Phase-12 changes

VALIDATION (FAIL IF NOT TRUE)
- Demo 1206 launches
- hero is visible
- hero moves left/right
- hero jumps with Space
- gravity is active
- collision works in normal play
- camera follow remains stable
- parallax remains clearly visible
- tilemap is larger than viewport
- visible scrolling occurs during normal play
- trigger zone exists
- entering the trigger zone displays success state/message
- no collectible counter exists
- no switch/checkpoint system exists
- no diff outside:
  - samples/Phase 12 - Demo Games/Demo 1206 - Trigger Zone/**
  - samples/index.html (only if needed)
- no engine/tools/tests/games changes
- README matches actual behavior

COMMIT MESSAGE
BUILD_PR: implement Demo 1206 trigger zone

- add integrated Demo 1206 runtime
- preserve proven movement, jump, collision, camera follow, and parallax behavior
- add a visible trigger zone with simple success state on entry
- keep scope to one light interaction system only
- no engine, tools, tests, or games changes

OUTPUT CONTRACT (MANDATORY)
- Produce a repo-structured delta ZIP
- Output path:
  <project folder>/tmp/BUILD_PR_DEMO1206_TRIGGER_ZONE_delta.zip
- ZIP must contain only changed/added files for this BUILD_PR
- ZIP must not be empty
