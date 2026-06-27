# Rule System Foundation

PR: PR_26152_161-rule-system-foundation
Date: 2026-06-02

## Scope

- Defined the rule system foundation.
- Defined manifest ownership.
- Added no runtime implementation.

## Foundation

Rules are manifest-owned declarations that describe intended gameplay behavior. Engine runtime owns validated interpretation and execution of those declarations. Rules must be data, not embedded JavaScript, hidden defaults, sample fixtures, or ProjectWorkspace state.

## Rule Types

| Rule | Manifest Ownership | Runtime Ownership |
| --- | --- | --- |
| Movement | Speed, acceleration, axes, controls, constraints, target object types. | Apply per-frame movement and update transient velocity/position. |
| Bounce | Bounce surfaces, axes, restitution, bounds references. | Detect boundary/collision response and mutate runtime velocity. |
| Gravity | Gravity vector, acceleration, affected object types, optional terminal velocity. | Apply gravity during physics steps. |
| Health | Initial/max health, invulnerability windows, death behavior reference. | Track current health, damage windows, death state. |
| Damage | Damage amount, source object types, target object types, hitbox/collision references. | Apply damage events after collision/action resolution. |
| Collision | Collision layers, masks, shape refs, responses, blocking/nonblocking behavior. | Resolve actual contacts and report hit events. |
| Spawn | Spawn source, interval, limit, pattern, object type, initial state. | Tick timers, instantiate runtime objects, enforce limits. |
| Despawn | Lifetime, offscreen behavior, on-hit behavior, on-collect behavior. | Remove or deactivate runtime objects. |
| Scoring | Score events, point values, combos, extra-life thresholds. | Mutate current score, emit HUD/status updates. |
| Cooldowns | Action cooldown duration, target action, reset behavior. | Track elapsed runtime timers and gate actions. |

## Expected Manifest Shape

```json
{
  "rules": {
    "movement.player-thrust": {
      "type": "movement",
      "targetObjects": ["object.player.ship"],
      "speed": 250,
      "inputActions": ["moveLeft", "moveRight"]
    },
    "scoring.alien-hit": {
      "type": "scoring",
      "event": "collision.playerProjectile.alien",
      "points": 30
    }
  }
}
```

This is a planning baseline only. It is not implemented in the manifest schema or runtime.

## Ownership Rules

- Manifest owns rule ids, rule type, static parameters, declared targets, and rule-to-object linkage.
- Engine runtime owns algorithmic execution, current timers, current scores, current health, current collisions, and event dispatch.
- Tool State may produce rule authoring payloads in future, but persisted runtime output still flows through Project and Game Manifest boundaries.
- ProjectWorkspace may coordinate active manifest/toolState references only; it must not store rule state or rule execution history.

## Current Evidence

- `src/engine/systems/MovementSystem.js`, `BounceSystem.js`, `CollisionSystem.js`, `ProjectileSystem.js`, `LifecycleSystem.js`, and `CollectSystem.js` already expose reusable runtime behavior.
- `src/engine/world/SpawnSystem.js` accepts rule-like data but is not wired to a manifest-owned rule section.
- `src/engine/combat/Combat.js` exposes health/damage primitives, but the game manifest does not yet define health or damage rule records.
- `games/SpaceInvaders/game/SpaceInvadersWorld.js` and `games/SpaceDuel/game/ScoreManager.js` keep scoring, lives, spawn cadence, and thresholds in game code.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - documentation/static rule ownership review.
- contract - documentation/static manifest rule baseline review.

## Lanes Skipped

- runtime - no runtime behavior changed.
- integration - no ProjectWorkspace handoff implementation changed.
- samples - permanently out of scope for this stack.
- recovery/UAT - no recovery behavior changed.
- Playwright - not impacted.

## Samples Decision

SKIP. Samples are permanently out of scope for this stack.

## Playwright

Playwright impacted: No. This PR is docs/report-only.

## Blocker Scope

No blocker for the foundation report. Implementation is blocked until manifest rule schema, validation fixtures, and runtime interpreter scope are explicitly approved.
