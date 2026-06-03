# Manifest Runtime Loader Plan

PR: PR_26152_166-manifest-runtime-loader-plan
Date: 2026-06-02

## Scope

- Defined manifest runtime loader architecture.
- Defined manifest parsing ownership.
- Defined runtime object creation ownership.
- Defined rule attachment ownership.
- Defined asset binding ownership.
- Added no runtime implementation.

## Loader Purpose

The manifest runtime loader is the future engine-owned adapter that converts validated `game.manifest.json` data into runtime-ready engine objects, rule registrations, asset bindings, and bootstrap diagnostics.

The loader must not own authoring state, ProjectWorkspace state, Tool State persistence, sample data, user code, or hidden fallback data.

## Ownership

| Loader Stage | Owner | Responsibility |
| --- | --- | --- |
| Manifest fetch/read | Runtime host or caller | Provide explicit manifest payload/path. |
| Manifest parse | Loader | Parse JSON payload and preserve source path metadata. |
| Manifest validation | Shared schema/contract validation | Reject invalid manifest/object/rule data before runtime use. |
| Object creation | Loader plus engine ECS | Convert object declarations into ECS entities/components. |
| Rule attachment | Loader plus rule registry | Attach validated rule ids to objects and runtime systems. |
| Asset binding | Loader plus asset services | Resolve manifest asset ids/paths to runtime resources. |
| Diagnostics | Loader plus engine logger/events | Emit PASS/FAIL/WARN/SKIP with exact stage and source path. |

## Proposed Flow

1. Receive explicit manifest input from direct game launch or ProjectWorkspace handoff.
2. Parse manifest payload.
3. Validate manifest envelope, object declarations, rule registry, asset references, and tool payload references.
4. Resolve asset bindings by manifest path and asset id.
5. Create runtime object blueprints from manifest object declarations.
6. Create ECS entities/components from blueprints.
7. Attach validated rule definitions to runtime systems.
8. Start engine only after validation and binding pass.
9. Reject visibly on failure before partial render.

## Runtime Object Creation Ownership

Runtime object creation belongs under reusable `src/engine` capability. The first implementation should add a small engine adapter that maps validated object records to `World` entities and component data. Game-specific code may consume the adapter later, but the adapter itself should not live in a specific game folder.

## Rule Attachment Ownership

Rule attachment should use a shared rule registry under `src/engine` once approved. The manifest owns rule data; engine owns rule execution. Attachment should fail when an object references a missing rule or a rule targets a missing object.

## Asset Binding Ownership

Asset binding should resolve from manifest-owned asset ids and paths. Runtime may create loaded handles, caches, and resolved URLs, but must not rewrite manifest records or create hidden asset defaults.

## Required `src` Capabilities

- manifest envelope validation adapter
- object type validator bridge
- rule registry validator bridge
- runtime object factory
- manifest asset binding resolver
- diagnostics surface for loader stages
- no-render failure path

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - documentation/static loader architecture plan.
- integration - documentation/static ProjectWorkspace manifest handoff boundary review.
- contract - documentation/static manifest ownership review.

## Lanes Skipped

- runtime - no runtime behavior changed.
- samples - permanently out of scope.
- recovery/UAT - no recovery behavior changed.
- Playwright - not impacted.

## Samples Decision

SKIP. Samples are permanently out of scope.

## Playwright

Playwright impacted: No. This PR is docs/report-only.

## Blocker Scope

No blocker for the loader plan. Implementation is blocked until schema/contract validation for object and rule payloads exists.
