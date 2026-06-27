# Engine V2 Combat Runtime Closeout

PR: PR_26152_233-engine-v2-combat-runtime-closeout
Date: 2026-06-03

## Scope

- Closed the Engine V2 combat runtime capability lane for abilities, projectiles, status effects, and weapons.
- Validated the four combat slices together through targeted headless engine tests.
- Documented reuse/adapt/new decisions for existing runtime and legacy combat helpers.
- Kept samples, tools, and game-specific combat logic out of scope.

## Validation

Commands:

```powershell
node tests/engine/EngineV2AbilitySystem.test.mjs
node tests/engine/EngineV2ProjectileSystem.test.mjs
node tests/engine/EngineV2StatusEffectSystem.test.mjs
node tests/engine/EngineV2WeaponSystem.test.mjs
```

Result: PASS.

## Reuse / Adapt / New Decisions

| Surface | Decision | Notes |
| --- | --- | --- |
| `src/engine/runtime/runtimeDamageProcessing.js` | Reuse | Status effects integrate with the existing manifest-driven damage processor. |
| `src/engine/runtime/runtimeCooldownProcessing.js` | Adapt by contract | Ability system consumes explicit cooldown results instead of embedding cooldown state. |
| `src/engine/runtime/runtimeConditionSystem.js` | Adapt by contract | Ability system consumes condition matches as runtime input. |
| `src/engine/runtime/runtimeEventSystem.js` | Adapt by contract | Ability system consumes runtime events as runtime input. |
| `src/engine/runtime/runtimeActionSystem.js` | Adapt by contract | Abilities and weapons emit action/damage/status requests for downstream systems. |
| `src/engine/combat/Combat.js` | Reference only | Legacy helper mutates combatants and contains defaults that do not fit Engine V2 cleanly. |
| `src/engine/systems/ProjectileSystem.js` | Reference only | Legacy projectile system mutates projectile arrays and owns movement state directly. |
| `src/engine/events/EventBus.js` | Reference only | Event emitter helper is not needed for this deterministic headless runtime slice. |

## Lane Status

| Area | Status | Notes |
| --- | --- | --- |
| Abilities | PASS | Active/passive abilities resolve from explicit cooldown, condition, event, and action inputs. |
| Projectiles | PASS | Manifest projectile definitions produce runtime records, movement commands, and collision outcomes. |
| Status effects | PASS | Runtime status effects produce damage and movement modifier outputs. |
| Weapons | PASS | Weapons compose abilities, projectiles, damage, and status effects through generic outputs. |
| Samples | SKIP | Permanently out of scope. |
| Tools | SKIP | Out of scope. |

## Next Runtime Capability Slice

Next lane: combat application and playable-loop integration.

Expected first slice:

- attach ability and weapon outputs to the existing runtime action flow
- route projectile movement commands through the runtime movement processor
- route projectile/status damage outputs through runtime damage processing
- connect status movement modifiers to movement processing without hidden defaults
- preserve manifest-driven configuration and visible error handling
- keep samples and tool work out of scope

## Lanes Executed

- engine - Engine V2 combat runtime closeout validation.
- runtime - headless ability, projectile, status effect, and weapon processing only.

## Lanes Skipped

- samples - permanently out of scope.
- tools - out of scope.
- browser Playwright - not part of this headless engine validation.

## Playwright

Playwright impacted: No browser/tool UI impact. This closeout validates headless runtime processors through targeted Node tests.

## Manual Validation

Review the four new Engine V2 combat modules and tests to confirm the lane remains manifest-driven, generic, and independent from samples, tools, and hard-coded combat behavior.

## Blocker Scope

No blocker for the Engine V2 combat runtime lane.
