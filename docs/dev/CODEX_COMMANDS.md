MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_ASSET_BROWSER_IMPORT_HUB_AND_PALETTE_BROWSER_MANAGER using the latest uploaded GitHub repo as the baseline.

REQUIREMENTS:
1. Build two new first-class tools under tools/:
   - tools/Asset Browser/  -> display name: Asset Browser / Import Hub
   - tools/Palette Browser/ -> display name: Palette Browser / Manager
2. Register both in tools/toolRegistry.js as active first-class tools.
3. Ensure tools/index.html renders them through the shared registry-driven surface.
4. Remove the planned placeholder cards for these two tools once the real tools are live.
5. Ensure any remaining older Asset Browser naming is normalized to "Asset Browser / Import Hub".
6. Keep Sprite Editor first-class and visible.
7. Keep SpriteEditor_old_keep legacy and hidden.
8. Keep samples off the tools landing page.
9. Use shared engine/platform shell + theme for both new tools.
10. Update the registry validator so it verifies:
    - both new tools exist in registry
    - folder path matches registry path
    - active first-class tools are surfaced
    - legacy tools remain excluded
    - placeholder cards are not left behind for live tools
11. Keep changes surgical and aligned to current repo conventions.

PACKAGE OUTPUT:
<project folder>/tmp/BUILD_PR_ASSET_BROWSER_IMPORT_HUB_AND_PALETTE_BROWSER_MANAGER.zip
