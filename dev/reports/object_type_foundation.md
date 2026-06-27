# Object Type Foundation

PR: PR_26152_160-object-type-foundation
Date: 2026-06-02

## Scope

- Defined the object type foundation.
- Defined ownership and expected manifest structure.
- Added no runtime implementation.

## Foundation

Object types are manifest-owned declarations that describe what an object is allowed to do. Engine runtime remains responsible for interpreting validated object type records into runtime components, systems, and transient state.

Object type declarations should live under a future manifest-owned object section, separate from tool payload identity and separate from ProjectWorkspace runtime state. Object geometry may continue to resolve from object-vector data, while object type declarations define gameplay semantics.

## Object Types

| Object Type | Purpose | Expected Manifest Fields | Runtime Responsibility |
| --- | --- | --- | --- |
| Static | Non-moving object, terrain, wall, decorative or blocking element. | `objectId`, `type: "static"`, `geometryRef`, optional `collision`, optional `render`. | Render, collision participation, no autonomous movement. |
| Dynamic | Moving object that can update position or velocity. | `objectId`, `type: "dynamic"`, `geometryRef`, `movement`, optional `collision`. | Apply movement rules and runtime velocity. |
| Killable | Object with health/death lifecycle. | `objectId`, `type: "killable"`, `health`, optional `damageResponses`, optional `despawn`. | Track transient health and death state. |
| Collectible | Object consumed by a collector. | `objectId`, `type: "collectible"`, `collectRules`, optional `score`, optional `despawn`. | Detect collection, apply rule effects, remove or update object. |
| Trigger | Object that emits actions on contact, zone entry, or event. | `objectId`, `type: "trigger"`, `triggerEvent`, `conditions`, optional `cooldown`. | Evaluate runtime conditions and emit events. |
| Projectile | Moving object spawned by another object/action. | `objectId`, `type: "projectile"`, `spawn`, `movement`, `damage`, `lifetime`, optional `collision`. | Spawn, move, collide, expire, and report damage events. |
| Zone | Spatial gameplay region. | `objectId`, `type: "zone"`, `bounds` or `geometryRef`, `zoneRules`. | Track enter/exit/inside behavior. |
| UI | HUD/menu/status object rendered by runtime. | `objectId`, `type: "ui"`, `binding`, `layout`, `render`. | Bind runtime state to display, without owning game rules. |

## Expected Manifest Shape

```json
{
  "objects": {
    "object.player.ship": {
      "type": "dynamic",
      "geometryRef": "object.asteroids.ship",
      "rules": ["movement.player-thrust", "collision.player", "health.player"]
    }
  }
}
```

This shape is a planning baseline only. It is not implemented in `toolbox/schemas/game.manifest.schema.json` yet.

## Ownership Rules

- Manifest owns object identity, object type, geometry references, rule references, and author-authored defaults.
- Tool State owns editor-specific saved payloads for tools that produce object geometry or object definitions.
- ProjectWorkspace owns only active references and handoff coordination.
- Engine runtime owns current position, velocity, timers, collision results, health changes, collection events, spawn instances, and render frames.

## Current Evidence

- `toolbox/schemas/game.manifest.schema.json` currently defines object-vector geometry under `tools.object-vector-studio-v2`, but not gameplay object type declarations.
- `src/engine/components/Components.js` has reusable component names such as `transform`, `velocity`, `collider`, `solid`, `lifetime`, and `tag`.
- `games/Asteroids/game/asteroidsObjectGeometryManifest.js` maps required geometry ids, showing a game-specific bridge from manifest geometry to runtime use.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - documentation/static object type ownership review.
- contract - documentation/static manifest ownership review.

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

No blocker for the foundation report. Implementation is blocked until a future PR adds a manifest object type schema and targeted runtime validation.
