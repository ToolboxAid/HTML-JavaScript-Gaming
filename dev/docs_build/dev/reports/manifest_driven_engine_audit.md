# Manifest Driven Engine Audit

PR: PR_26152_162-manifest-driven-engine-audit
Date: 2026-06-02

## Scope

- Audited current engine against manifest-driven architecture.
- Identified hard-coded behaviors.
- Identified engine ownership gaps.
- Identified config-driven readiness gaps.
- Added no runtime implementation.

## Audit Summary

Current manifests are strongest for launch, assets, palette, input mapping, music/tool payloads, and object-vector geometry. Engine runtime already contains reusable systems for movement, collision, spawning, combat, rendering, and lifecycle. The missing middle is an approved manifest-owned gameplay object/rule contract plus a runtime interpreter that converts validated manifest data into engine systems.

## Current Manifest Readiness

| Surface | Status | Evidence |
| --- | --- | --- |
| Launch and screen | READY | `toolbox/schemas/game.manifest.schema.json` defines `launch` and optional `screen`. |
| Assets and palette | READY | Game manifests use `tools.asset-manager-v2` and `tools.palette-manager-v2`. |
| Input mappings | READY | Game manifests use `tools.input-mapping-v2`. |
| Object geometry | PARTIAL | Object-vector data exists in manifests; gameplay type semantics are still game-specific. |
| Object types | GAP | No manifest schema section for static/dynamic/killable/collectible/trigger/projectile/zone/UI. |
| Rules | GAP | No manifest schema section for movement/bounce/gravity/health/damage/collision/spawn/despawn/scoring/cooldowns. |
| Runtime interpreter | GAP | Engine systems exist, but there is no shared manifest-to-ECS/rule loader. |

## Hard-Coded Behavior Findings

| Area | Current Location | Finding |
| --- | --- | --- |
| Space Invaders constants | `games/SpaceInvaders/game/SpaceInvadersWorld.js` | Player size/speed, alien rows/columns, spawn interval, score cycle, lives, respawn delays, and bomb types are code-owned. |
| Space Duel scoring | `games/SpaceDuel/game/ScoreManager.js` | Starting lives and extra-life step are code-owned. |
| Space Duel waves | `games/SpaceDuel/game/WaveController.js` | Enemy score values, hazard score, shot score, enemy counts, hazard counts, speed ranges, cooldown ranges, and spawn rules are code-owned. |
| Asteroids wave setup | `games/Asteroids/game/AsteroidsWorld.js` | Asteroid counts, safe spawn rectangles, world dimensions, spawn margins, attempts, and update step caps are code-owned. |
| Asteroids runtime object bridge | `games/Asteroids/game/asteroidsObjectGeometryManifest.js` | Required object ids are manifest-related but game-specific, not yet a shared object type contract. |
| Projectile defaults | `src/engine/systems/ProjectileSystem.js` | Runtime helper has default projectile size, life, color, and velocity defaults instead of manifest-required explicit values. |
| Input defaults | `src/engine/systems/InputControlSystem.js` | Runtime helper defaults to arrow-key bindings when no binding data is passed. Future manifest-driven lane should reject missing bindings instead. |
| Rendering defaults | `src/engine/systems/RenderSystem.js` | Runtime helper uses hard-coded stroke color, label color, and font defaults. |

## Engine Ownership Gaps

| Gap | Needed Ownership |
| --- | --- |
| Manifest gameplay object validation | Shared manifest schema/contract should validate object type records before runtime. |
| Manifest rule validation | Shared manifest schema/contract should validate rule records before runtime. |
| Manifest-to-ECS loader | Engine should map validated object/rule records to ECS components and systems. |
| Rule interpreter | Engine should interpret declarative rules without embedding game-specific code. |
| Error reporting | Invalid object/rule records should reject before render with actionable logs. |
| No silent defaults | Runtime helpers should receive explicit manifest-derived values in config-driven mode. |

## Config-Driven Readiness Gaps

| Priority | Gap |
| --- | --- |
| 1 | Add manifest object type schema and fixtures. |
| 2 | Add manifest rule schema and fixtures. |
| 3 | Add engine validation adapter for manifest object/rule payloads. |
| 4 | Add manifest-to-runtime object factory for ECS/component creation. |
| 5 | Add rule interpreter for movement, collision, spawn, despawn, scoring, health, damage, and cooldowns. |
| 6 | Add targeted engine validation for manifest-only game boot without sample dependency. |

## ProjectWorkspace Boundary

ProjectWorkspace remains coordination-only. It may pass explicit manifest and Tool State references into toolbox/runtime validation, but it must not persist gameplay objects, rules, active entity state, score state, health state, timers, or hidden defaults.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - documentation/static audit of engine and game runtime ownership.
- contract - documentation/static review of manifest and ProjectWorkspace boundaries.

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

No blocker for the audit report. Config-driven implementation remains blocked on approved manifest object/rule schemas and targeted engine validation.
