Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_8_3_VALIDATION_MATRIX.md

# Level 8.3 Validation Matrix

## Validation Modes
- baseline: default behavior
- stress: high-load spawn/event pressure
- edge: low/zero-entity and overlap-edge scenarios

## Scenario Activation
Use query flags on sample URLs:
- `?validation=baseline`
- `?validation=stress`
- `?validation=edge`

## Asteroids (`sample149-asteroids-world-systems`)
| area | baseline | stress | edge |
|---|---|---|---|
| Spawn pressure | standard wave rates | burst intervals + high limits | zero-spawn wave + single-entity wave |
| Lifecycle pressure | standard bullet expiry | aggressive maxEntities/lifetime tuning | very short lifetime window |
| World state pressure | normal wave progression | fast rollover under heavy clears | immediate transitions on empty spawn |
| Events pressure | timed + repeating mix | overlapping repeated acceleration | same-tick overlap events |
| Cross-system interaction | steady | spawn/lifecycle/event contention | transition with overlapping events |

## Space Invaders (`sample153-space-invaders-world-systems`)
| area | baseline | stress | edge |
|---|---|---|---|
| Spawn pressure | standard formation waves | dense invader bursts | zero then single invader wave |
| Lifecycle pressure | normal cleanup | reduced lifetimes under high counts | tight limits/lifetime |
| World state pressure | normal clear -> next wave | fast complete under high fire tempo | empty-spawn transition checks |
| Events pressure | ufo + tempo events | repeated ufo + repeated tempo ramps | overlapping spawn-phase events |
| Cross-system interaction | stable | wave motion + event tempo contention | event overlap during spawn completion |

## Pacman Lite (`sample156-pacman-lite-world-systems`)
| area | baseline | stress | edge |
|---|---|---|---|
| Spawn pressure | standard pellet rounds | dense pellet/power population | zero then single spawn rounds |
| Lifecycle pressure | normal bounds/cleanup | high entity caps with shorter windows | low-cap edge behavior |
| World state pressure | round progression by remaining entities | rapid clear/repopulate cycles | empty-round transition behavior |
| Events pressure | frightened + bonus + tempo | repeated frightened/bonus windows | overlapping spawn-phase events |
| Cross-system interaction | stable | ghost speed + frightened overlap | transition race with low counts |

## Findings Summary
- Reuse path remains stable under baseline/stress/edge configuration modes.
- No new world-system classes introduced in game scenes.
- Scenario changes are config-driven and local to scene orchestration layer.
- No engine defects observed in this pass.
