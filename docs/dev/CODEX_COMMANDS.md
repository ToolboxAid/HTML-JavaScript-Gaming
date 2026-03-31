MODEL: GPT-5.3-codex
REASONING: high

BUILD_PR_DEMO1205_MULTI_SYSTEM_DEMO

Use the existing Phase 12 Demo progression as the source contract.

THIS IS A MANDATORY CHANGE.
A NO-OP RESULT IS INVALID.

SCOPE
Implement Demo 1205 - Multi-System Demo as an integrated showcase using:
- tilemap
- hero movement
- jump
- gravity
- collision
- camera follow
- parallax

Add exactly one light interaction layer:
- collectible counter

DEMO CONTRACT
- preserve the proven runtime behavior pattern from Demo 1204
- do not redesign gameplay or camera behavior
- the only major new concept is collectible interaction + counter
- world must remain larger than the viewport
- scrolling must remain clearly visible

REQUIRED WORK
1. Implement Demo 1205 using repo-consistent demo structure
2. Add a visible hero
3. Preserve:
   - Left Arrow = move left
   - Right Arrow = move right
   - Space = jump
4. Preserve gravity, grounded behavior, collision, camera follow, and parallax
5. Add simple collectible pickups placed in the world
6. When hero touches a collectible:
   - collectible disappears
   - counter increments
7. Optionally display all-collected success state if it stays sample-local and simple
8. Keep README.md accurate
9. Update samples/index.html only if strictly required for launch correctness

ALLOWED CHANGES
Primary:
- samples/Phase 12 - Demo Games/Demo 1205 - Multi-System Demo/**

Secondary only if strictly required:
- samples/index.html

BLOCKED FEATURES
- trigger zone
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
- Demo 1205 launches
- hero is visible
- hero moves left/right
- hero jumps with Space
- gravity is active
- collision works in normal play
- camera follow remains stable
- parallax remains clearly visible
- tilemap is larger than viewport
- visible scrolling occurs during normal play
- collectibles exist
- collectibles disappear on touch
- counter increments on collection
- no trigger zone or switch/checkpoint system exists
- no diff outside:
  - samples/Phase 12 - Demo Games/Demo 1205 - Multi-System Demo/**
  - samples/index.html (only if needed)
- no engine/tools/tests/games changes
- README matches actual behavior

COMMIT MESSAGE
BUILD_PR: implement Demo 1205 multi-system demo with collectible counter

- add integrated Demo 1205 runtime
- preserve proven movement, jump, collision, camera follow, and parallax behavior
- add collectible pickups with disappearance on touch and counter increment
- keep scope to one light interaction system only
- no engine, tools, tests, or games changes

OUTPUT CONTRACT (MANDATORY)
- Produce a repo-structured delta ZIP
- Output path:
  <project folder>/tmp/BUILD_PR_DEMO1205_MULTI_SYSTEM_DEMO_delta.zip
- ZIP must contain only changed/added files for this BUILD_PR
- ZIP must not be empty
