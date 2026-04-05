MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_TOOLS_INDEX_SURFACE_CLEANUP as a docs-first, surgical surface cleanup PR for HTML-JavaScript-Gaming.

GOAL:
Make `tools/index.html` show only true first-class launchable tools. Keep `Sprite Editor` first-class and visible. Keep `SpriteEditor_old_keep` legacy and hidden. Remove `Advanced Systems & Extensions` from the tools landing page unless each item in that section is verified to be an actual active launchable tool under `tools/`.

TARGET FILES TO AUDIT:
- tools/index.html
- tools/toolRegistry.js
- tools/renderToolsIndex.js
- any config/data feeding the tools page

RULES:
1. `tools/index.html` is a user-facing tool launcher, not a platform/dev page.
2. Only render entries that are true first-class tools.
3. Keep `Sprite Editor` active and visible.
4. Keep `SpriteEditor_old_keep` hidden from active UI.
5. If `Advanced Systems & Extensions` entries are platform/dev/internal, move or delete them.
6. If they are duplicate/placeholder/dead, delete them.
7. Do not expand scope beyond this cleanup.
8. Preserve engine theme usage.

EXPECTED ACTIVE TOOLS:
- Vector Map Editor
- Vector Asset Studio
- Tilemap Studio
- Parallax Scene Studio
- Sprite Editor

EXPECTED RESULT:
- no misleading `Advanced Systems & Extensions` on main tools page unless truly valid
- no legacy tool leakage
- registry and rendered landing page aligned
- no broken links

OUTPUT:
<project folder>/tmp/BUILD_PR_TOOLS_INDEX_SURFACE_CLEANUP.zip
