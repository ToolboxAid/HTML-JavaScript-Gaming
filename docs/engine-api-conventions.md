# Engine API Conventions

This document defines lightweight, shared method conventions used across the engine.

## Lifecycle Methods

### `init(...)`
- Purpose: allocate/setup resources and validate required dependencies.
- When to use: static utility/runtime setup (`CanvasUtils.init`, `PerformanceMonitor.init`) or one-time object setup.
- Rule: should be safe to call once; if called again, either no-op safely or throw a clear error.

### `start()`
- Purpose: begin active behavior (listeners, timers, polling, loops).
- When to use: input/controllers/managers with an active running state.
- Rule: idempotent. Calling `start()` repeatedly should not duplicate listeners or timers.

### `update(deltaTime, ...)`
- Purpose: advance runtime state for one tick/frame.
- When to use: game objects, controllers, and frame-driven systems.
- Rule: should no-op safely when destroyed/inactive.

### `draw(...)`
- Purpose: render current state only.
- When to use: render-capable objects/systems.
- Rule: avoid mutating gameplay state inside `draw` except render-local cache maintenance.

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
- Collection membership/indexing belongs in manager/registry/system classes.
- Cross-object coordination belongs in systems/facades (for example `GameObjectSystem`, `GameCollision`).

## Compatibility Rule

When renaming lifecycle methods for consistency:
- Keep a compatibility alias for at least one transition phase.
- Update internal call sites to the canonical name first (`start/stop/destroy`).
