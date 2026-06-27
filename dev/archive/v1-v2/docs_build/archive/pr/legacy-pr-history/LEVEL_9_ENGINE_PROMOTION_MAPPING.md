Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_9_ENGINE_PROMOTION_MAPPING.md

# Level 9 Engine Promotion Mapping

## Candidate Inventory
| candidate | current owner | current path | reuse proof |
|---|---|---|---|
| Spawn System | sample shared | `samples/shared/worldSystems.js` | Asteroids, Space Invaders, Pacman Lite |
| Lifecycle System | sample shared | `samples/shared/worldSystems.js` | Asteroids, Space Invaders, Pacman Lite |
| World State System | sample shared | `samples/shared/worldSystems.js` | Asteroids, Space Invaders, Pacman Lite |
| Events System | sample shared | `samples/shared/worldSystems.js` | Asteroids, Space Invaders, Pacman Lite |

## Proposed Engine Domain Mapping
| candidate | proposed engine domain | proposed path | rationale |
|---|---|---|---|
| Spawn System | `src/engine/world` | `src/engine/world/SpawnSystem.js` | world population and timed creation concern |
| Lifecycle System | `src/engine/world` | `src/engine/world/LifecycleSystem.js` | world entity cleanup/lifetime/bounds concern |
| World State System | `src/engine/state` | `src/engine/state/WorldStateSystem.js` | phase/wave transition state machine concern |
| Events System | `src/engine/events` | `src/engine/events/WorldEventsSystem.js` | deterministic trigger/effect orchestration concern |

## Ownership Before/After
| system | before | after |
|---|---|---|
| Spawn System | sample/game layer | engine-owned reusable subsystem |
| Lifecycle System | sample/game layer | engine-owned reusable subsystem |
| World State System | sample/game layer | engine-owned reusable subsystem |
| Events System | sample/game layer | engine-owned reusable subsystem |

## Contract Guardrails
- No rendering logic in promoted systems.
- No input logic in promoted systems.
- No game-specific values or action rules in promoted systems.
- Game/sample layer keeps configuration, tuning, and game rules.
