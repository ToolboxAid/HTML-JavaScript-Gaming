# Manifest Runtime Boundary

PR: PR_26152_159-manifest-runtime-boundary
Date: 2026-06-02

## Scope

- Defined the manifest-to-runtime boundary.
- Defined what belongs in `game.manifest.json`.
- Defined what belongs in engine runtime.
- Defined authoritative ownership.
- Added no runtime implementation.

## Boundary

`game.manifest.json` is the portable authored game configuration surface. It should describe what a game is and what data the runtime consumes after validation. It must not become executable code, hidden runtime state, sample fallback data, or ProjectWorkspace storage.

Engine runtime owns interpretation, execution, timing, rendering, input dispatch, physics, collision algorithms, audio playback, scene orchestration, and error reporting. Runtime may consume manifest data only after explicit validation and must reject invalid handoff before partial render.

## Belongs In `game.manifest.json`

| Area | Manifest Ownership |
| --- | --- |
| Identity | Game id, display name, folder, schema/version. |
| Launch | Direct launch path and optional ProjectWorkspace launch path. |
| Screen | Intended canvas/screen dimensions and viewport configuration. |
| Assets | Asset ids, file/path references, roles, types, and portable metadata. |
| Input | Action names and declared input bindings. |
| Object geometry | Object ids, tags, shape payloads, animation states, and runtime object identity. |
| Object types | Future declarative object type records such as static, dynamic, killable, collectible, trigger, projectile, zone, and UI. |
| Rules | Future declarative gameplay rule records such as movement, bounce, gravity, health, damage, collision, spawn, despawn, scoring, and cooldowns. |
| Tool payload references | Project/tool payload data that is already approved as manifest-owned or Tool State-owned. |

## Belongs In Engine Runtime

| Area | Runtime Ownership |
| --- | --- |
| Execution | Main loop, fixed tick, scene transitions, update/render order. |
| Algorithms | Physics, collision resolution, pathfinding, combat application, spawn ticking, rendering transforms. |
| Runtime state | Transient entity state, timers, active scene state, frame metrics, current input state, audio handles. |
| Validation handling | Rejecting invalid manifest/toolState handoff before render and logging actionable failures. |
| Asset resolution | Resolving manifest paths to loadable runtime resources without rewriting manifest ownership. |
| ProjectWorkspace handoff | Accepting explicit manifest/toolState inputs while leaving ProjectWorkspace as coordination-only. |

## Authoritative Ownership

| Surface | Owns | Must Not Own |
| --- | --- | --- |
| Project | Persisted DB container and ownership boundary. | Runtime session state. |
| ProjectWorkspace | Runtime-only working context and active references. | Saved game data, Tool State payloads, manifest payloads. |
| Tool State | Persisted per-tool payload record. | Engine execution logic. |
| Game Manifest | Portable export/import description of a game. | Database source of truth or runtime session state. |
| Engine runtime | Validated execution of manifest-authored data. | Authored configuration ownership. |

## Current Evidence

- `toolbox/schemas/game.manifest.schema.json` currently owns schema/version, game identity, launch, screen, music, and a `tools` map.
- `src/shared/contracts/gameManifestContract.js` defines Game Manifest as portable export/import format, not the database source of truth.
- `src/shared/contracts/projectWorkspaceRuntimeContract.js` defines ProjectWorkspace as runtime-only and forbids persisted payload/storage fields.
- `src/engine/core/Engine.js` owns runtime loop, scene updates, rendering, fullscreen layers, audio, and runtime monitoring.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - documentation/static boundary review for manifest-to-runtime ownership.
- contract - documentation/static review against Game Manifest, Tool State, and ProjectWorkspace contracts.

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

No blocker for the documentation boundary. Future implementation is blocked until object type and rule contracts are explicitly promoted into manifest schema/runtime validation.
