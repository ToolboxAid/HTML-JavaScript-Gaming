MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_PROJECT_SYSTEM as a docs-first but implementation-ready platform slice.

GOALS:
1. Add a shared project system for all active first-class tools.
2. Keep Sprite Editor first-class.
3. Keep SpriteEditor_old_keep hidden legacy.
4. Keep tools/index.html tool-only.
5. Persist assets and palettes by shared references, not tool-local duplication.

IMPLEMENT:
- shared project service/context
- project manifest contract
- serializer + validator + migration entry points
- new/open/save/save-as/close flows in the shared shell
- dirty-state tracking
- project name in header
- per-tool persistence adapters for active tools only

ACTIVE TOOLS:
- Vector Map Editor
- Vector Asset Studio
- Tilemap Studio
- Parallax Scene Studio
- Sprite Editor
- Asset Browser / Import Hub
- Palette Browser / Manager

RULES:
- no samples added back
- no legacy tooling on active surface
- no per-tool independent project roots
- use engine theme for all project UI
- preserve registry-driven tool surfacing

OUTPUT:
<project folder>/tmp/BUILD_PR_PROJECT_SYSTEM.zip
