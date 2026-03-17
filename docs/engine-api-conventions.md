# Engine API Conventions

This document defines lightweight, shared method conventions used across the engine.

## Lifecycle Methods

### `init(...)`
- Purpose: allocate/setup resources and validate required dependencies.
- When to use: static utility/runtime setup (`CanvasUtils.init`, `PerformanceMonitor.init`, `Fullscreen.init`) or constructor-triggered one-time setup (`MidiPlayer.init`).
- Rule: should be safe to call once; if called again, either no-op safely or throw a clear error.

### `initialize(...)`
- Purpose: coordinate multiple lower-level `init(...)` calls behind one instance-level entry point.
- When to use: runtime/facade wrappers such as `RuntimeContext.initialize(...)` and `GameBase.initializeGame(...)`.
- Rule: keep orchestration here; leave subsystem-specific setup in the underlying `init(...)` methods.

### `onInitialize(...)`
- Purpose: game-specific async startup hook after shared runtime setup is complete.
- When to use: subclasses extending `GameBase`.
- Rule: treat it as the canonical game boot hook; load assets, wire inputs, and create initial state here.

### `start()`
- Purpose: begin active behavior (listeners, timers, polling, loops).
- When to use: input/controllers/managers with an active running state.
- Rule: idempotent. Calling `start()` repeatedly should not duplicate listeners or timers.

### `update(deltaTime, ...)`
- Purpose: advance runtime state for one tick/frame.
- When to use: game objects, controllers, timers, and frame-driven systems.
- Rule: should no-op safely when destroyed/inactive.

### `gameLoop(deltaTime, runtimeContext)`
- Purpose: run one full game frame after shared engine setup and before overlay rendering.
- When to use: `GameBase` subclasses.
- Rule: treat this as the main per-frame game hook; keep engine shell behavior in `GameBase.animate(...)`.

### `draw(...)`
- Purpose: render current state only.
- When to use: render-capable objects/systems.
- Rule: avoid mutating gameplay state inside `draw` except render-local cache maintenance.

### `clear()`
- Purpose: remove all managed entries owned by a system or manager.
- When to use: collection-oriented facades such as `GameObjectSystem`.
- Rule: prefer `clear()` for bulk removal and keep `destroy()` as the terminal teardown alias when both exist.

### `stop()`
- Purpose: pause/stop active behavior started by `start()`.
- When to use: listeners, polling, timers, audio loops, subscriptions.
- Rule: idempotent. Must clean up all resources allocated by `start()`.

### `destroy()`
- Purpose: final teardown and release of owned resources.
- When to use: all long-lived instances that allocate state/resources.
- Rule: idempotent and terminal. After destroy, methods should no-op or fail safely.

## State Ownership

- Object instance state belongs on the object (`x`, `y`, animation counters, loaded assets).
- Runtime singletons/facades own shared browser services (`RuntimeContext` wraps canvas, fullscreen, performance, and timer integration).
- Canvas helper ownership should stay narrow:
  `CanvasUtils` owns canvas/context lifecycle, `CanvasText` owns text/metrics helpers, and `CanvasSprite` owns low-level sprite/frame blits.
- Collection membership/indexing belongs in manager/registry/system classes.
- Cross-object coordination belongs in systems/facades (for example `GameObjectSystem`, `GameCollision`).
- Frame-state normalization belongs in shared helpers when multiple systems need identical semantics (for example `InputFrameState` and `AnimationFrameStepper`).
- Shared engine UI renderers should stay config-driven and avoid owning game rules (`GamePlayerSelectUi` draws selection UI, while `GameUtils.resolvePlayerSelection(...)` resolves the chosen player count).

## Compatibility Rule

When renaming lifecycle methods for consistency:
- Keep a compatibility alias for at least one transition phase.
- Update internal call sites to the canonical name first (`initialize`, `start`, `stop`, `destroy`).
- Current example: `GamepadManager.disconnect()` is a compatibility alias that forwards to `stop()`.

## Testing Convention

- Default automated engine tests should remain Node-safe and run through `npm test`.
- Cover lifecycle idempotency and safe no-op behavior in the default suite when adding new engine primitives.
- Browser-only behavior should use lightweight harnesses/mocks where practical so tests can stay in the default manifest.
