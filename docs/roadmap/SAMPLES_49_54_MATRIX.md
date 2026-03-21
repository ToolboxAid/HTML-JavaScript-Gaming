Toolbox Aid
David Quesenberry
03/21/2026
SAMPLES_49_54_MATRIX.md

# Samples 49-54 Matrix

| Sample | Theme | Depends On | Engine Areas | Main Proof | Must Not Become |
|---|---|---|---|---|---|
| 49 | Real Sprite Rendering | 43, 48 | assets, render | image-backed actor path | animation rewrite |
| 50 | Animation System V2 | 49 | animation, render, state | timing + looping + transitions | physics rewrite |
| 51 | Physics System | 50 (light), 48 | ecs, systems, movement/physics | velocity + acceleration + friction | collision overhaul |
| 52 | Collision Resolution V2 | 51 | collision, tilemap, systems | slide + corner handling | tile metadata pass |
| 53 | Tile Metadata | 45, 52 | tilemap, persistence | hazards + triggers + metadata schema | event engine rewrite |
| 54 | NES-style Zones + Parallax | 49-53 | camera, render, tilemap | zone camera + layered depth | full game level |

## Review checklist
- Is the sample proving one idea clearly?
- Did reusable logic move to `engine/`?
- Does the sample still match the Sample01 structure pattern?
- Does README explain what was standardized?
- Did the PR avoid pulling future sample work into the current one?
