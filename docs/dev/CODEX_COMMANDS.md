MODEL: GPT-5.4
REASONING: high

TASK:
Create BUILD_PR_ASSET_USAGE_INTEGRATION.

OBJECTIVE:
Wire the shared asset system into all active first-class tools, using the latest uploaded GitHub repo state.

IN SCOPE:
- Vector Map Editor
- Vector Asset Studio
- Tilemap Studio
- Parallax Scene Studio
- Sprite Editor
- shared Asset Browser / Import Hub integration
- shared Palette Browser / Manager integration
- registry-safe tool surfacing
- engine theme consistency
- contract documentation

OUT OF SCOPE:
- SpriteEditor_old_keep
- restoring samples to tools/index.html
- showcase game content
- unrelated refactors

REQUIREMENTS:
1. Sprite Editor must remain first-class and visible.
2. SpriteEditor_old_keep must remain hidden legacy.
3. tools/index.html must stay tool-only.
4. Tools consume shared assets/palettes; they do not own duplicated private copies by default.
5. Normalize shared action labels:
   - Browse Assets
   - Import Assets
   - Browse Palettes
   - Manage Palettes
6. Preserve engine theme and shared shell consistency.
7. Update/extend the registry validator if needed so surfacing remains correct.

IMPLEMENTATION TARGETS:
- add shared launch hooks/actions in each active tool
- connect each tool to Asset Browser / Import Hub
- connect each tool to Palette Browser / Manager
- document the asset and palette handoff contracts
- avoid structural churn unless required for the integration

VALIDATE:
- all active tools can launch asset/palette flows
- no samples reappear on tools/index.html
- no legacy leakage
- no broken paths
- action labels consistent
- engine theme consistent

OUTPUT:
<project folder>/tmp/BUILD_PR_ASSET_USAGE_INTEGRATION.zip
