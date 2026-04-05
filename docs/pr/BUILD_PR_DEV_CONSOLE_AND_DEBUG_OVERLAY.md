Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY.md

# BUILD_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY

## Purpose
Create a docs-only BUILD PR that locks the implementation contract for a development console and debug overlay layer that sits above engine core and aligns with the approved runtime scene loader and render pipeline contract.

Upstream dependency (already approved):
- `toolbox.render.asset-document`
- `toolbox.render.composition-document`
- deterministic render staging and composition rules across all 4 producers
- runtime scene loader and hot reload orchestration contract

This BUILD PR does not include implementation code.

## Scope
In scope:
- diagnostics contract
- command registry contract
- overlay panel contract
- deterministic render ordering with debug overlay last
- explicit public engine mappings
- hot reload survival rules
- validation and test requirements

Out of scope:
- engine-core rewrites
- sample-specific console hacks
- tool/editor-specific runtime coupling
- arbitrary eval command support
- implementation code

## 1. Diagnostics Contract
Diagnostics data must be produced through a bounded adapter contract and consumed by both console and overlay.

### 1.1 Envelope
```json
{
  "contractVersion": "1.0.0",
  "timestamp": 0,
  "runtime": {},
  "camera": {},
  "render": {},
  "entities": {},
  "tilemap": {},
  "input": {},
  "assets": {},
  "hotReload": {},
  "validation": {},
  "errors": []
}
```

Required top-level fields:
- `contractVersion`
- `timestamp`
- `runtime`
- `render`
- `hotReload`
- `validation`
- `errors`

Rules:
- adapters are read-only views over public engine state
- no direct reads from private engine internals
- missing optional sections must degrade gracefully
- diagnostics sampling must be deterministic per frame tick

### 1.2 Error shape
```json
{
  "level": "error",
  "code": "DIAGNOSTICS_ADAPTER_UNAVAILABLE",
  "stage": "collect",
  "message": "Adapter unavailable.",
  "details": {}
}
```

Rules:
- errors are structured and machine-readable
- failures in one adapter must not break full diagnostics collection
- console/overlay must remain responsive when partial diagnostics fail

## 2. Command Registry Contract
Console commands must be registry-driven.

### 2.1 Command shape
```json
{
  "name": "scene.info",
  "category": "scene",
  "description": "Show active scene summary",
  "usage": "scene.info",
  "mutatesRuntime": false,
  "execute": "function(context, args)"
}
```

Required fields:
- `name`
- `category`
- `description`
- `usage`
- `mutatesRuntime`
- `execute(context, args)`

Rules:
- no arbitrary eval
- read-only commands by default (`mutatesRuntime=false`)
- mutable commands allowed only when explicitly flagged and validated
- deterministic registration conflict policy: first core command wins, extension collision rejected with structured warning
- command output must be structured lines or structured objects

### 2.2 Minimum core commands
- `help`
- `status`
- `scene.info`
- `scene.reload`
- `camera.info`
- `render.info`
- `entities.count`
- `tilemap.info`
- `input.info`
- `assets.info`
- `hotreload.info`
- `hotreload.enable`
- `hotreload.disable`
- `validation.info`
- `overlay.show`
- `overlay.hide`
- `overlay.toggle <panel>`

## 3. Overlay Panel Contract
Overlay panels must use a shared panel descriptor.

### 3.1 Panel shape
```json
{
  "id": "runtime-summary",
  "title": "Runtime",
  "enabled": true,
  "priority": 100,
  "source": "runtime",
  "renderMode": "text-block",
  "refreshMs": 250
}
```

Required fields:
- `id`
- `title`
- `enabled`
- `priority`
- `source`
- `renderMode`

Rules:
- deterministic panel ordering by `priority`, then `id`
- panel data must come from diagnostics contract only
- panel-level failure isolation is mandatory
- overlay off should avoid recurring panel render work

### 3.2 Minimum panel families
- runtime summary
- fps/frame timing
- scene identity
- camera state
- entity counts
- render stage status
- tilemap summary
- input summary
- hot reload status
- validation warnings

## 4. Deterministic Render Ordering
Debug instrumentation surfaces must render after authored scene content.

Required order:
1. parallax
2. tilemap
3. entities
4. sprite/effects
5. vector overlay/authored overlays
6. debug overlay
7. dev console surface

Rules:
- debug overlay and console are runtime instrumentation surfaces, not scene layers
- debug surfaces must not reorder authored scene stages
- overlay and console ordering must remain stable across hot reload cycles

## 5. Engine Mapping Contract (Public Only)
Required mappings:
- runtime summary -> lifecycle/runtime state public adapter
- fps/frame timing -> renderer/frame timing public adapter
- scene info -> scene lifecycle public adapter
- camera info -> Camera2D/CameraSystem public adapter
- tilemap info -> tilemap runtime public adapter
- input info -> InputService/ActionInputService public adapter
- entity summary -> ECS world summary public adapter
- validation summary -> contract validation public adapter
- hot reload status -> runtime scene loader/hot reload coordinator public adapter

Boundary rules:
- no private engine object traversal from console/overlay modules
- no tool-specific contracts inside engine core systems
- extension points remain optional and removable

## 6. Hot Reload Survival Rules
Must survive normal development reloads without diagnostics duplication.

Required behavior:
- console history survives normal reload when safe
- overlay visibility state survives normal reload when safe
- diagnostics state resets only when schema/runtime boundary requires reset
- failed reload keeps last-known-good runtime scene active
- failed reload emits structured console and overlay status
- repeated reloads must not duplicate overlay panels, handlers, or command registrations

Reload modes:
- targeted domain reload: preserve unaffected diagnostics context
- full recompose reload: preserve shell state where safe, rebuild data bindings deterministically

## 7. Validation Requirements
Implementation APPLY must include validation gates for:
- diagnostics envelope validity
- command registration validity
- command name conflict handling
- panel descriptor validity
- deterministic render ordering with debug overlay last
- hot reload survival (state preserved / no duplication)
- structured error emission on contract failures

Non-silent rejection:
- invalid command definition -> reject registration and emit structured warning/error
- invalid panel descriptor -> reject panel and continue runtime
- adapter failure -> emit structured diagnostics error, keep overlay/console operational

## 8. Test Requirements
### 8.1 Unit tests
- diagnostics adapter contract shaping
- command registry add/lookup/duplicate behavior
- command execution error handling
- overlay panel deterministic ordering
- panel failure isolation

### 8.2 Integration tests
- runtime scene + overlay enabled preserves render order
- console commands reflect active runtime/hot reload status
- hot reload success path keeps overlay/console alive
- hot reload failure preserves last-known-good scene and diagnostics shell
- repeated reload cycles do not duplicate panels/commands

### 8.3 Manual validation checklist (APPLY)
- toggle console and overlay via documented controls
- run core commands and verify structured outputs
- confirm overlay renders after authored content
- trigger hot reload and verify no duplicate diagnostics UI
- trigger invalid reload and verify fallback + structured error visibility

## 9. Deliverables For This BUILD PR (Docs-Only)
- `docs/pr/BUILD_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/change_summary.txt`
- `docs/dev/validation_checklist.txt`
- `docs/dev/file_tree.txt`
- `docs/dev/next_command.txt`

## 10. Packaging
Output zip path:
- `<project folder>/tmp/BUILD_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY_delta.zip`

Zip constraints:
- repo-relative structure preserved
- docs-only files for this PR purpose
- no implementation files

## Commit Comment
`docs: build dev console and debug overlay contract bundle`

## Next Command
`APPLY_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY`
