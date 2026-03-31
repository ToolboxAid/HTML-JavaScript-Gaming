MODEL: GPT-5.3-codex
REASONING: high

BUILD_PR_PHASE12_RENAME_TO_DEMO_GAMES

MANDATORY (NO NO-OP)

1. Rename:
samples/Phase 12 - Sample Games/
→ samples/Phase 12 - Demo Games/

2. Rename folders:
sample1201-* → Demo 1201 - Tilemap Viewer
sample1202-* → Demo 1202 - Tilemap Hero Movement
sample1203-* → Demo 1203 - Tilemap Hero Jump Collision
sample1204-* → Demo 1204 - Tilemap Parallax Hero
sample1205-* → Demo 1205 - Multi-System Demo
sample1206-* → Demo 1206 - Trigger Zone
sample1207-* → Demo 1207 - Switch Checkpoint Marker
sample1208-* → Demo 1208 - Tool Formatted Tiles Parallax

3. Update samples/index.html

VALIDATE:
- Only Phase 12 + index.html changed
- No runtime changes

OUTPUT:
<project>/tmp/BUILD_PR_PHASE12_RENAME_TO_DEMO_GAMES_delta.zip
