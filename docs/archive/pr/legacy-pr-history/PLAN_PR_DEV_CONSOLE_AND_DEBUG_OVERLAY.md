Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY.md

# PLAN PR — Dev Console and Debug Overlay

## Objective
Define a docs-first, implementation-ready plan for a development console and on-screen debug overlay that integrates cleanly with the existing engine, runtime scene loader, hot reload workflow, and render pipeline contract. This PR is planning only. Codex will implement in the later BUILD/APPLY phases.

## Why This PR Exists
The repo now has a contract-driven content pipeline and a runtime scene loader / hot reload direction. The next high-value step is a developer-facing diagnostics layer that helps inspect runtime state without polluting engine contracts or sample/game logic.

This PR establishes:
- a dev console interaction model
- a debug overlay rendering model
- clean engine boundaries
- shared data contracts for diagnostics
- rollout constraints that avoid runtime-breaking changes

## Scope
In scope:
- dev console feature definition
- debug overlay feature definition
- engine boundary rules
- public diagnostics contract
- command categories and access rules
- overlay panel inventory
- hot reload integration expectations
- validation and testing plan
- phased implementation sequencing for BUILD_PR and APPLY_PR

Out of scope:
- implementation code
- engine API breakage
- game-specific debug commands
- production telemetry backends
- remote admin tooling
- persistence-heavy profiling systems

## Architectural Position
The diagnostics layer must sit above the engine internals and consume only approved public selectors / adapters. It must not reach directly into private engine structures. It must not create sample-specific or tool-specific coupling.

### Required layering
1. Engine systems own runtime state
2. Public diagnostics adapters expose approved read-only views
3. Dev console consumes diagnostics adapters plus approved actions
4. Debug overlay renders from the same diagnostics contract
5. Samples and future games may register extra commands through a documented extension point

## Goals
- speed up runtime inspection during sample/tool iteration
- pair naturally with hot reload
- expose deterministic state snapshots
- keep overlay rendering lightweight and optional
- prevent diagnostics code from becoming a hidden second engine API

## Non-Goals
- replacing browser devtools
- building a full in-game IDE
- adding invasive instrumentation to every subsystem in this PR
- allowing arbitrary mutation of engine internals through free-form console eval

## User Experience Targets
### Dev Console
The console should allow:
- open/close toggle
- command entry
- command history
- structured output lines
- warning/error/info severity display
- discoverable help command
- optional command auto-complete in later phases

### Debug Overlay
The overlay should allow:
- top-level on/off toggle
- modular panels
- lightweight real-time readouts
- stable panel ordering
- visibility presets for common workflows

## Core Feature Set
### Dev Console commands (initial families)
- help
- status
- scene
- camera
- render
- entities
- tilemap
- input
- assets
- hotreload
- validation
- overlay

### Debug overlay panels (initial families)
- runtime summary
- fps / frame timing
- scene identity
- camera state
- entity counts
- render stage state
- tilemap summary
- input summary
- hot reload state
- validation / contract warnings

## Public Diagnostics Contract
All diagnostics must flow through an approved contract object. Example shape:

```json
{
  "runtime": {
    "sceneId": "sample-001",
    "fps": 60,
    "frameTimeMs": 16.6,
    "paused": false
  },
  "camera": {
    "x": 0,
    "y": 0,
    "zoom": 1
  },
  "render": {
    "stages": [
      "parallax",
      "tilemap",
      "entities",
      "sprites",
      "vectorOverlay",
      "debugOverlay"
    ]
  },
  "hotReload": {
    "enabled": true,
    "pending": false,
    "lastReloadAt": null
  },
  "validation": {
    "errorCount": 0,
    "warningCount": 0
  }
}
```

## Formal Render Ordering
The debug overlay must render last and must never interfere with deterministic world render ordering.

### Required order
1. parallax
2. tilemap
3. entities
4. sprite / effect layer
5. vector overlay / authored overlay content
6. debug overlay
7. dev console surface

### Rule
The debug overlay and console are developer surfaces, not authored scene layers. They are runtime instrumentation surfaces and must remain outside tool-authored scene composition.

## Engine Mapping Lock
The BUILD/APPLY phases must map diagnostics features to bounded engine areas without guessing.

### Required mappings
- runtime summary -> engine lifecycle + runtime state adapter
- fps/frame timing -> renderer or frame timing adapter
- scene panel -> scene lifecycle adapter
- camera panel -> Camera2D / CameraSystem adapter
- tilemap panel -> tilemap adapter
- input panel -> InputService / ActionInputService adapter
- entity panel -> ECS world summary adapter
- validation panel -> contract validation summary adapter
- hot reload panel -> runtime scene loader / hot reload controller adapter

## Console Command Model
Commands must be structured and routed through a command registry.

### Required command fields
- name
- category
- description
- usage
- execute(context, args)

### Rules
- no arbitrary eval
- no unrestricted object traversal
- commands may return structured lines or structured objects
- mutating commands must be explicitly marked and limited
- read-only commands are the default

## Minimum initial command list
- help
- status
- scene.info
- scene.reload
- camera.info
- render.info
- entities.count
- tilemap.info
- input.info
- assets.info
- hotreload.info
- hotreload.enable
- hotreload.disable
- validation.info
- overlay.show
- overlay.hide
- overlay.toggle <panel>

## Overlay Panel Contract
Each overlay panel must conform to a small shared definition.

```json
{
  "id": "runtime-summary",
  "title": "Runtime",
  "enabled": true,
  "priority": 100,
  "source": "runtime",
  "renderMode": "text-block"
}
```

### Panel rules
- deterministic priority ordering
- no panel-specific direct engine reads
- render from diagnostics contract only
- failures in one panel must not crash the entire overlay

## Extension Model
Samples / future games may register additional diagnostics commands and overlay panels, but only through public extension points.

### Extension rules
- extension registration is optional
- extensions must declare ids and categories
- extensions cannot override core commands without explicit conflict rules
- extensions must remain removable without changing engine internals

## Hot Reload Integration
The diagnostics layer must cooperate with hot reload.

### Required behavior
- overlay survives normal reloads when safe
- console history survives normal reloads when safe
- diagnostics state resets cleanly when required by runtime changes
- failed reloads must report clearly in console and overlay
- reload status must not duplicate entities or stack overlays

## Error Handling
### Must support
- command not found
- invalid args
- diagnostics adapter unavailable
- panel render failure
- hot reload failure
- contract validation failure

### Required behavior
- emit structured error message
- keep console responsive
- isolate panel failures
- do not crash runtime loop because diagnostics failed

## Performance Constraints
- overlay off means near-zero recurring cost outside minimal state checks
- console closed means no unnecessary DOM / canvas work beyond registration
- refresh rates may be throttled for expensive summaries
- diagnostics collection must prefer cached summaries where appropriate
- no per-frame deep traversal of ECS state unless explicitly requested

## Accessibility / Usability
- readable font size
- keyboard-first console interaction
- consistent toggle bindings
- severity markers for output
- predictable panel placement

## Suggested Controls
- backtick or configurable key to toggle console
- F3 or configurable key to toggle overlay
- Shift+F3 cycles overlay presets
- Esc closes console if open

BUILD phase may refine bindings if conflicts exist, but must preserve discoverability.

## Files Expected In Later BUILD/APPLY Phases
Potential implementation targets, subject to Codex refinement:
- engine/debug/DebugOverlay.js
- engine/debug/DevConsole.js
- engine/debug/DiagnosticsRegistry.js
- engine/debug/DiagnosticsAdapters.js
- engine/debug/ConsoleCommandRegistry.js
- tests/debug/DebugOverlay.test.mjs
- tests/debug/DevConsole.test.mjs
- tests/debug/DiagnosticsRegistry.test.mjs

## Validation Plan
BUILD/APPLY must validate:
- overlay renders last
- no engine-private access leaks into diagnostics consumers
- command registry is deterministic
- unknown commands fail gracefully
- panel failure isolation works
- overlay and console do not duplicate on hot reload
- overlay can be disabled cleanly
- diagnostics output remains stable across reloads

## Test Plan
### Unit tests
- command registry registration and lookup
- diagnostics adapter shaping
- panel ordering
- panel error isolation
- hot reload state preservation policy

### Integration tests
- runtime scene loader + overlay enabled
- hot reload updates while overlay active
- console commands report current scene and reload status
- validation warnings visible in console/overlay

## Risks
- accidental debug code coupling to engine internals
- overlay becoming a hidden second renderer
- console mutators becoming unsafe
- hot reload duplication bugs
- performance drift from excessive diagnostics work

## Mitigations
- adapter-only reads
- strict render-order contract
- read-only-by-default command registry
- throttled summaries
- explicit failure isolation
- focused tests before expansion

## Deliverable for BUILD_PR
BUILD_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY must produce docs that:
- lock command registry contract
- lock diagnostics contract
- lock overlay panel contract
- define engine mappings explicitly
- define hot reload survival rules
- define tests and validation details precisely
- preserve header rules, including no header on docs/dev/commit_comment.txt

## Exit Criteria for This PLAN_PR
This plan is complete when the future BUILD_PR can proceed without guessing:
- what the console is
- what the overlay renders
- where diagnostics data comes from
- where instrumentation must stop
- how hot reload interacts with diagnostics
- how failures are surfaced

## Next Command
BUILD_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY
