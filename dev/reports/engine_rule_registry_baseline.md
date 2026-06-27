# Engine Rule Registry Baseline

PR: PR_26152_165-engine-rule-registry-baseline
Date: 2026-06-02

## Scope

- Defined the authoritative rule registry model.
- Defined rules as data-driven definitions.
- Covered movement, bounce, gravity, health, damage, collision, spawn, despawn, scoring, and cooldown.
- Defined manifest ownership.
- Added no runtime implementation.

## Rule Registry Model

The rule registry is a manifest-owned catalog of gameplay rule definitions. Each rule is data, not executable JavaScript. Engine runtime owns validated interpretation, rule ordering, runtime state, and event output.

Future rule records should be addressable by stable `ruleId` and referenced from object declarations. Rule records must not store ProjectWorkspace state, samples, localStorage/sessionStorage state, auth state, or active runtime entity state.

## Rule Record Shape

```json
{
  "ruleId": "movement.player-thrust",
  "ruleType": "movement",
  "targets": ["object.player.ship"],
  "parameters": {},
  "events": {}
}
```

This shape is a planning baseline only and is not implemented in schema or runtime.

## Rule Ownership

| Rule Type | Manifest Owns | Engine Runtime Owns | Existing Reusable Surface |
| --- | --- | --- | --- |
| Movement | Speed, acceleration, axes, input action refs, target object refs. | Per-frame position/velocity updates and bounds application. | `MovementSystem.js`, `InputControlSystem.js`. |
| Bounce | Bounds refs, surface refs, restitution, axis. | Collision/bounds detection and velocity response. | `BounceSystem.js`, collision helpers. |
| Gravity | Gravity vector, affected targets, terminal velocity. | Per-tick velocity integration. | Physics primitives and movement systems. |
| Health | Max health, initial health, invulnerability duration, death refs. | Current health, death state, invulnerability timers. | `src/engine/combat/Combat.js`. |
| Damage | Damage amount, source/target refs, hitbox refs, knockback. | Damage application, hit events, current health mutation. | Combat and collision helpers. |
| Collision | Layers, masks, response type, blocking flag, shape refs. | Contact detection, response execution, hit event reporting. | `CollisionSystem.js`, collision helpers. |
| Spawn | Spawn source, target object, interval, count limit, pattern. | Runtime timers, spawned entity creation, count tracking. | `src/engine/world/SpawnSystem.js`. |
| Despawn | Lifetime, offscreen rule, on-hit/on-collect behavior. | Runtime removal/deactivation and event output. | `LifecycleSystem.js`, projectile/update helpers. |
| Scoring | Event refs, point values, thresholds, bonus rules. | Active score mutation, high-score event output. | Future scoring adapter required. |
| Cooldown | Action refs, duration, reset behavior, initial state. | Runtime cooldown timers and action gating. | Future cooldown adapter required. |

## Registry Rules

- Each rule must declare `ruleId`, `ruleType`, target references, and parameters.
- Rule parameters must be serializable manifest data.
- Rule ordering must be explicit when order matters.
- Runtime-only state belongs in engine runtime, not the manifest.
- Invalid rule records must reject before entity creation or render.
- No rule may rely on hidden defaults in config-driven mode.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - documentation/static rule registry baseline.
- contract - documentation/static manifest ownership review.

## Lanes Skipped

- runtime - no runtime behavior changed.
- integration - no ProjectWorkspace handoff implementation changed.
- samples - permanently out of scope.
- recovery/UAT - no recovery behavior changed.
- Playwright - not impacted.

## Samples Decision

SKIP. Samples are permanently out of scope.

## Playwright

Playwright impacted: No. This PR is docs/report-only.

## Blocker Scope

No blocker for the baseline report. Runtime implementation is blocked until rule schema, fixtures, and registry validation are approved.
