Toolbox Aid
David Quesenberry
03/31/2026
PLAN_PR_SAMPLE_GAMES_FOUNDATION.md

GOAL
Define Sample Games phase including hero interaction and multi-system integration.

DEFINITION
Sample Games are playable integrated demos combining multiple engine systems.

STRUCTURE
samples/Phase 12 - Sample Games/
1201-tilemap-viewer/
1202-tilemap-hero-movement/
1203-tilemap-hero-jump-collision/
1204-tilemap-parallax-hero/
1205-multi-system-demo/

HERO CONTRACT
- Left/Right: move
- Space/Up: jump
- Camera follows hero
- Collision with tilemap

RULES
- Use only engine public contracts
- No reusable logic
- Fully removable
- Follow scene contract

CONSTRAINTS
- No engine changes
- No game systems (menus, save, AI)

VALIDATION
- Multiple systems working
- Playable
- No engine impact
