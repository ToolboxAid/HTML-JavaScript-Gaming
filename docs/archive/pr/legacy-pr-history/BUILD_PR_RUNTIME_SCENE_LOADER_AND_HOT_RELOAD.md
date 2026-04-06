Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD.md

# BUILD_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD

## Purpose
Create a docs-only BUILD PR that defines the implementation contract for runtime scene loading and hot reload, using the already approved cross-tool render pipeline contract as the upstream dependency.

Upstream dependency (already approved):
- `toolbox.render.asset-document`
- `toolbox.render.composition-document`
- producer mappings for Tile Map Editor, Parallax Editor, Sprite Editor, Vector Asset Studio

This BUILD PR adds no implementation code.

## Scope
In scope:
- formal runtime scene loader responsibilities
- hot reload lifecycle and deterministic reload order
- watcher bridge boundaries
- public engine mappings only
- validation and structured error taxonomy
- composition-driven reload rules
- focused test plan and validation checklist

Out of scope:
- engine core API redesign
- tool payload redesign
- sample-specific runtime ownership
- unrelated refactors
- implementation code

## Runtime Scene Loader Responsibilities

### SceneCompositionLoader
Responsibilities:
- accept a composition document (`toolbox.render.composition-document`)
- validate composition envelope, version, producer identity, and references
- resolve referenced asset documents (`toolbox.render.asset-document`)
- normalize scene package structure for runtime consumption
- return structured errors on failure

Non-responsibilities:
- no schema migration
- no silent mutation of invalid input
- no direct rendering

### RuntimeSceneLoader
Responsibilities:
- load normalized scene package into runtime through public engine entry points
- initialize scene domains in deterministic stage order
- track domain-level handles for targeted reload/dispose
- preserve domain isolation (reload only affected domain unless full-recompose is required)

Non-responsibilities:
- no file watching
- no editor/tool UI ownership
- no sample-only private integration paths

## Hot Reload Lifecycle
Hot reload must be optional in development and use deterministic ordering that matches initial load.

Lifecycle:
1. WatcherBridge receives a file-change event.
2. HotReloadCoordinator classifies changed artifact domain(s).
3. Validate changed document(s) against locked contract schema.
4. Resolve composition impact (targeted domain reload vs full recompose).
5. Perform staged reload in deterministic order.
6. Swap runtime handles atomically for affected domain(s).
7. Dispose retired handles.
8. Emit structured success/failure event.
9. On failure, preserve last known-good runtime state.

Deterministic reload order:
1. composition metadata
2. parallax domain
3. tilemap domain
4. sprite/entity domain
5. vector/overlay domain
6. ready signal

## Watcher Bridge Boundaries
Responsibilities:
- normalize external file-change events into runtime-safe event payloads
- provide only path + event-type + timestamp + optional hash metadata
- remain optional and disabled outside development mode

Boundaries:
- no schema validation ownership
- no composition assembly ownership
- no direct runtime scene mutation
- no engine core lifecycle ownership

## Public Engine Mappings (Locked)
Only public mappings are allowed:
- composition doc -> `SceneCompositionLoader`
- normalized scene package -> `RuntimeSceneLoader`
- parallax contract payload -> approved parallax runtime entry path
- tilemap contract payload -> approved tilemap runtime entry path
- sprite contract payload -> approved sprite/entity runtime entry path
- vector contract payload -> approved vector runtime entry path
- lifecycle wiring -> scene init/update/render/dispose public flow

No internal/private engine bypass is allowed in this PR.

## Validation and Error Taxonomy
Validation levels:
- composition envelope validation
- referenced asset-document validation
- domain-specific payload validation
- cross-reference validation (asset IDs, layer refs, domain refs)

Structured error envelope:
- `level`: `error` | `warning`
- `stage`: `load` | `validate` | `resolve` | `compose` | `reload` | `dispose`
- `code`: deterministic machine-readable code
- `path`: document path or domain path
- `message`: human-readable summary
- `details`: stable object payload

Required non-silent rejection behavior:
- invalid version -> reject
- invalid schema -> reject
- missing required reference -> reject
- unsupported producer mapping -> reject
- reload validation failure -> reject reload, keep last known-good state

## Composition-Driven Reload Rules
Targeted reload rules:
- parallax-only change -> reload parallax domain only
- tilemap-only change -> reload tilemap + dependent collision domain only
- sprite-only change -> reload sprite/entity domain only
- vector-only change -> reload vector/overlay domain only

Full recompose triggers:
- composition manifest changed
- layer/domain ordering changed
- document-level metadata affecting scene assembly changed

All reload decisions must be deterministic and recorded in structured events.

## Test Plan
Automated tests to implement in APPLY PR:
- valid composition load succeeds
- unsupported version fails fast
- missing reference fails with structured error
- deterministic stage ordering on initial load
- deterministic stage ordering on reload
- targeted parallax reload
- targeted tilemap reload
- targeted sprite reload
- targeted vector reload
- composition-change full recompose
- failed reload preserves last known-good scene state
- replaced handles are disposed

Manual validation checklist (APPLY PR):
- runtime scene loads from composition document with all 4 producers
- development watcher can trigger reload workflow
- invalid changed document is rejected without corrupting runtime state
- deterministic order is consistent across repeated reload cycles
- production mode disables watcher bridge cleanly

## Deliverables For This BUILD PR (Docs-Only)
- `docs/pr/BUILD_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/change_summary.txt`
- `docs/dev/validation_checklist.txt`
- `docs/dev/file_tree.txt`
- `docs/dev/next_command.txt`

## Packaging
Output delta zip path:
- `<project folder>/tmp/BUILD_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD_delta.zip`

Zip content constraints:
- repo-relative structure preserved
- docs-only files for this PR purpose
- no implementation files

## Commit Comment
`docs: build runtime scene loader and hot reload contract bundle`

## Next Command
`APPLY_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD`
