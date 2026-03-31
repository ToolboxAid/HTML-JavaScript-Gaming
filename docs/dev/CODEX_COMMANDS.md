MODEL: GPT-5.3-codex
REASONING: high

BUILD_PR_DEMO1208_TOOL_FORMATTED_TILES_PARALLAX

THIS IS A MANDATORY CHANGE.
A NO-OP RESULT IS INVALID.

PRIMARY GOAL
Implement Demo 1208 - Tool Formatted Tiles Parallax as a runnable authoring-pipeline validation demo.

SECONDARY REQUIRED FIX
Fix samples/index.html so Demo 1207 no longer links to README.md and instead opens the runnable demo entry page.

FOUNDATION TO PRESERVE
- tilemap
- hero movement
- Space-to-jump
- gravity
- grounded behavior
- collision
- camera follow
- parallax
- larger-than-viewport scrolling world

NEW CONCEPT FOR THIS PR
Use content formatted as if it came from the user's tools:
- tile content shaped like Tile Map Editor output
- SVG parallax content shaped like Parallax Editor output

REQUIRED WORK
1. Implement Demo 1208 using repo-consistent demo structure
2. Add actual tile assets for Demo 1208
3. Add actual SVG parallax assets for Demo 1208
4. Add sample-local config/data shaped like tool exports
5. Preserve proven hero movement, jump, gravity, collision, camera follow, and parallax behavior
6. Ensure the world is larger than the viewport and visibly scrolls
7. Update samples/index.html:
   - fix Demo 1207 link to point to runnable index.html, not README.md
   - point Demo 1208 to runnable index.html
8. Keep README.md accurate

ALLOWED CHANGES
Primary:
- samples/Phase 12 - Demo Games/Demo 1208 - Tool Formatted Tiles Parallax/**
Secondary:
- samples/index.html
Tertiary only if strictly required for the 1207 broken link fix:
- samples/Phase 12 - Demo Games/Demo 1207 - Switch Checkpoint Marker/**

BLOCKED CHANGES
- engine changes
- tool changes
- tests changes
- games changes
- non-Phase-12 changes beyond samples/index.html
- new gameplay systems
- enemies
- inventory
- menus
- save/load

VALIDATION (FAIL IF NOT TRUE)
- Demo 1208 launches
- actual tile assets are used
- actual SVG parallax assets are used
- hero is visible
- Left/Right movement works
- Space triggers jump
- gravity is active
- collision works
- camera follows hero cleanly
- parallax is visible
- tilemap is larger than viewport
- scrolling is visible during play
- Demo 1207 index target opens runnable page, not README.md
- Demo 1208 index target opens runnable page
- no diff outside:
  - samples/Phase 12 - Demo Games/Demo 1208 - Tool Formatted Tiles Parallax/**
  - samples/index.html
  - Demo 1207 files only if strictly required for the link fix
- no engine/tools/tests/games changes
- README matches actual behavior

COMMIT MESSAGE
BUILD_PR: implement Demo 1208 tool-formatted tiles parallax and fix Demo 1207 index link

- add runnable Demo 1208 using tool-shaped tile and SVG parallax assets
- preserve proven movement, jump, collision, camera follow, and parallax behavior
- fix samples/index.html so Demo 1207 opens runnable index.html instead of README.md
- keep change limited to Phase 12 demos and index
- no engine, tools, tests, or games changes

OUTPUT CONTRACT (MANDATORY)
- Produce a repo-structured delta ZIP
- Output path:
  <project folder>/tmp/BUILD_PR_DEMO1208_TOOL_FORMATTED_TILES_PARALLAX_delta.zip
- ZIP must contain only changed/added files for this BUILD_PR
- ZIP must not be empty
