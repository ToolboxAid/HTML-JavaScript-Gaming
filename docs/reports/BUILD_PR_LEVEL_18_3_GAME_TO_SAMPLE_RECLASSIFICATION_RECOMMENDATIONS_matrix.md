# BUILD_PR_LEVEL_18_3_GAME_TO_SAMPLE_RECLASSIFICATION_RECOMMENDATIONS

## Classification Matrix

| Entry | Classification | Recommended `phase-xx` Target (if move) | Rationale |
|---|---|---|---|
| `games/Bouncing-ball` | Remain in `games/` | n/a | Serves as the canonical minimal fully-playable arcade game in the Level 1 progression and is not marked as sample-track in the games roadmap carding. |
| `games/Gravity` | Recommend move to `samples/` | `phase-03` | Primarily a focused gravity-mechanics demonstration (force, damping, rebound behavior), which aligns better with gameplay-physics teaching slices than product-facing game catalog placement. |
| `games/Thruster` | Recommend move to `samples/` | `phase-04` | Core value is movement feel/input-response exploration (rotation + thrust + drift), which fits camera/feel/input tuning samples better than standalone game inventory. |
| `games/ProjectileLab` | Recommend move to `samples/` | `phase-02` | Explicitly a projectile behavior lab; best aligned to early world/system-building sample phases that already introduce projectile runtime patterns. |
| `games/Orbit` | Recommend move to `samples/` | `phase-06` | Orbits/trajectory shaping are simulation-first mechanics with educational value; this is a better fit for world-simulation sample sequencing than game catalog placement. |
| `games/PaddleIntercept` | Recommend move to `samples/` | `phase-03` | Intercept prediction and collision-response behavior are collision mastery demonstrations and map cleanly to gameplay-systems sample instruction. |
| `games/MultiBallChaos` | Recommend move to `samples/` | `phase-03` | Multi-entity collision/rebound stress is a systems demo for collision stability and pacing, best suited to collision-focused sample phases. |
| `games/PacmanLite` | Recommend move to `samples/` | `phase-13` | Already has a direct curriculum analogue (`Sample 1313 - Pacman Lite World Systems`), so the strongest fit is phase-13 sample treatment rather than duplicated game-track ownership. |

## Notes

- This BUILD bundle performs classification/recommendation only.
- No game-to-sample moves are executed in this PR.
- Roadmap status update is execution-backed by this completed matrix.
