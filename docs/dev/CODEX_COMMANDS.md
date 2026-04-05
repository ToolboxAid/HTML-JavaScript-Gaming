MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_ENGINE_THEME_FINAL_PLATFORM_INTEGRATION as a single combined build PR.

GOAL:
Finish the active tools platform in the fewest remaining steps by making all first-class tools use the engine theme and closing remaining platform-surface integration gaps.

DO:
1. Identify the existing engine theme source of truth
2. Normalize/extract a reusable shared theme contract only if needed
3. Apply the engine theme to all active tools under tools/
   - Vector Map Editor
   - Vector Asset Studio
   - Tile Map Editor
   - Parallax Editor
4. Unify shared shell/surface elements across active tools
5. Ensure active tools surface/index/navigation reflects only active tools
6. Preserve but exclude tools/SpritEditor_old_keep from active tool listings
7. Fix broken paths/imports/assets caused by the consolidation if encountered
8. Validate active tool loading and visual consistency

DO NOT:
- delete legacy Sprite content
- invent a second theme system
- perform unrelated refactors
- split into multiple PRs unless a true blocker is discovered

OUTPUT:
<project folder>/tmp/BUILD_PR_ENGINE_THEME_FINAL_PLATFORM_INTEGRATION.zip
