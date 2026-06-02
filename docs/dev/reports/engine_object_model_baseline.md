# Engine Object Model Baseline

PR: PR_26152_164-engine-object-model-baseline
Date: 2026-06-02

## Scope

- Defined the authoritative engine object model.
- Mapped object types to engine ownership.
- Defined Static, Dynamic, Killable, Collectible, Trigger, Projectile, Zone, and UI behavior ownership.
- Identified reusable `src` capability requirements.
- Added no runtime implementation.

## Authoritative Object Model

Engine objects are validated runtime records created from manifest-owned object declarations. The manifest owns authored object identity, object type, geometry references, rule references, and default configuration. Engine runtime owns entity creation, active component state, per-frame mutation, collision results, timers, and rendered output.

ProjectWorkspace remains coordination-only. It may identify the active project, manifest, tool, and toolState references, but it must not persist object records or runtime object state.

## Object Type Ownership

| Object Type | Manifest Owns | Engine Runtime Owns | Reusable `src` Capability |
| --- | --- | --- | --- |
| Static | Identity, geometry reference, render role, collision layer, blocking flag. | Entity creation, static collision participation, render participation. | `src/engine/ecs/World.js`, `src/engine/components/Components.js`, collision/render systems. |
| Dynamic | Identity, geometry reference, movement rule refs, collision refs. | Position, previous position, velocity, bounds response, input-driven movement. | `MovementSystem.js`, `InputControlSystem.js`, `BoundsSystem.js`. |
| Killable | Identity, max health, damage rules, death/despawn rule refs. | Current health, invulnerability, death flag, death events. | `src/engine/combat/Combat.js`, lifecycle/despawn adapters. |
| Collectible | Identity, collection conditions, scoring/despawn refs. | Collection detection, collected state, removal, event dispatch. | `CollectSystem.js`, collision helpers, scoring rule adapter. |
| Trigger | Identity, trigger condition, event name, cooldown rule refs. | Runtime enter/exit/contact evaluation, emitted event records, cooldown state. | Event bus, collision helpers, cooldown registry. |
| Projectile | Identity, spawn refs, movement, damage, lifetime, collision refs. | Spawned instance state, movement, collision, lifetime, despawn. | `ProjectileSystem.js`, `LifecycleSystem.js`, collision/combat helpers. |
| Zone | Identity, bounds/geometry, zone conditions, rule refs. | Runtime overlap tracking, enter/exit/inside events. | Collision helpers, event bus, zone adapter. |
| UI | Identity, binding source, layout slot, render role. | Runtime state binding, draw/update timing, user-visible status. | Rendering/UI runtime adapters. |

## Required Model Fields

Future manifest object records should require:

- `objectId`
- `objectType`
- `geometryRef` or explicit `bounds` for zone/UI records
- `rules` array
- `components` or component hints for runtime creation
- `visibility` or render participation where applicable

Runtime-created records should add only transient fields:

- `entityId`
- active component instances
- runtime timers
- collision/contact state
- current health/score/collected/despawn state

## Reusable `src` Capability Requirements

| Requirement | Current Capability | Gap |
| --- | --- | --- |
| Entity/component storage | `src/engine/ecs/World.js` | Needs manifest object factory wrapper. |
| Component primitives | `src/engine/components/Components.js` | Needs object-type component mapping and additional health/rule/cooldown components. |
| Movement | `src/engine/systems/MovementSystem.js` | Needs manifest-driven movement adapter. |
| Collision | `CollisionSystem.js` and collision helpers | Needs layer/mask/response registry. |
| Projectile lifecycle | `ProjectileSystem.js` and `LifecycleSystem.js` | Needs explicit manifest-derived defaults, no hidden fallback. |
| Health/damage | `src/engine/combat/Combat.js` | Needs object model adapter and manifest damage profile mapping. |
| Collection | `CollectSystem.js` | Needs manifest scoring/despawn integration. |
| Zones/triggers | Event/collision primitives | Needs shared zone/trigger runtime adapter. |
| UI object binding | Rendering/UI primitives | Needs manifest UI binding contract before implementation. |

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - documentation/static object model baseline.
- contract - documentation/static manifest and ProjectWorkspace ownership review.

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

No blocker for the baseline report. Runtime implementation is blocked until object model schema and validation are approved.
