MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_10_15_TEMPLATE_ASSET_STRUCTURE_AND_FULLSCREEN_BEZEL_FOUNDATION` as one small bundled PR with exactly these changes:

1. Normalize `games/_template/assets/` to match the current Asteroids asset directory structure:
   - audio/
   - fonts/
   - images/
   - palettes/
   - parallax/
   - parallax/data/.gitkeep
   - sprites/
   - sprites/data/.gitkeep
   - tilemaps/
   - tilemaps/data/.gitkeep
   - tilesets/
   - vectors/
   - vectors/data/.gitkeep
   - preserve `.gitkeep` where needed
   - do NOT copy Asteroids-specific content into `_template`

2. Add a minimal fullscreen bezel foundation that is clearly NOT Parallax:
   - use Asteroids `games/Asteroids/assets/images/bezel.png` as the first candidate asset
   - bezel only applies in fullscreen mode
   - bezel is screen-space, not world-space
   - implement as a dedicated explicit surface/class/module name such as `FullscreenBezelOverlay` or equivalent clear name
   - support draw mode contract with:
     - default `overlay` (draw last)
     - optional `underlay` support point for future use
   - keep scope minimal and engine-safe

3. Add/update focused tests or validation coverage for:
   - `_template` directory scaffold exists
   - bezel path/contract resolves correctly
   - fullscreen-only gating is covered
   - no Parallax coupling is introduced

4. Update roadmap status only by adding the bezel foundation item in the appropriate high-level roadmap area without rewriting unrelated roadmap text.

5. Final packaging step is REQUIRED:
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_10_15_TEMPLATE_ASSET_STRUCTURE_AND_FULLSCREEN_BEZEL_FOUNDATION.zip`

Hard rules:
- no commit-only result
- no missing ZIP
- no repo-wide unrelated edits
- keep changes surgical
