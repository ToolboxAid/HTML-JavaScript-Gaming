# Engine Review TODO

## Review workflow

- [ ] Todo
- [.] In progress
- [!] Blocker
- [-] Don't do
- [x] Complete
- [X] Complete

Objective:

- Inventory the engine surface area.
- Map responsibilities, entry points, shared utilities, browser dependencies, and current test coverage.
- Establish a consistent review checklist for correctness, API clarity, coupling, state management, lifecycle cleanup, error handling, security, and testability.

## Folder-by-folder code review

- [x] Review `engine/utils`.
- [x] Review `engine/math`.
- [x] Review `engine/physics`.
- [x] Review `engine/game`.
- [x] Review `engine/objects`.
- [x] Review `engine/renderers`.
- [x] Review `engine/input`.
- [x] Review `engine/messages`.
- [x] Review `engine/lifecycle`.
- [x] Review `engine/misc`.
- [x] Review `engine/output`.
- [x] Review `engine/animation`.
- [x] Review top-level engine files such as `canvas.js`, `gameBase.js`, `gameObject.js`, `gameObjectManager.js`, `gameObjectRegistry.js`, `gameObjectSystem.js`, `sprite.js`, and `tileMap.js`.

## Folder and naming review

- [x] Review whether folders reflect clear engine concepts and responsibilities.
- [x] Check whether files are located in the most appropriate folder.
- [x] Identify modules that should be moved closer to related systems or utilities.
- [x] Review naming consistency across folders, files, classes, methods, and variables.
- [x] Identify ambiguous, outdated, or misleading names.
- [x] Check whether singular vs plural naming is used consistently.
- [x] Review whether folder boundaries encourage good reuse or create confusion.
- [x] Identify top-level files that should move into a more specific engine subfolder.

## Architecture review

- [x] Evaluate module boundaries and shared abstractions.
- [x] Check for circular dependencies and hidden coupling.
- [x] Review naming consistency and API ergonomics.
- [x] Evaluate separation of concerns across engine layers.
- [x] Review inheritance vs composition choices.
- [x] Verify inheritance chains are shallow, intentional, and not carrying unrelated responsibilities.
- [x] Check whether subclasses truly satisfy parent contracts without surprising behavior.
- [x] Review ownership of data and state across modules, classes, and systems.
- [x] Verify that each piece of mutable state has a clear owner.
- [x] Identify shared mutable objects that should be isolated, copied, or encapsulated.
- [x] Review where state should live: object instance, manager, system, config, or runtime context.
- [x] Check lifecycle ownership for created resources such as listeners, timers, assets, and child objects.
- [x] Verify destroy/cleanup responsibilities are clearly owned and consistently enforced.
- [x] Review whether APIs expose too much internal state or allow unsafe mutation.
- [x] Identify unstable or overly broad engine APIs.

## Engine surface review

- [x] Identify which core engine classes should exist and whether any are missing.
- [x] Review whether current engine classes have clear responsibilities and useful boundaries.
- [x] Identify methods that should exist on core classes for consistency and usability.
- [x] Check for duplicated behavior that should be promoted into shared engine classes or helpers.
- [x] Review whether base classes define the right default lifecycle methods such as `init`, `update`, `draw`, `destroy`, `reset`, or `validate`.
- [x] Check whether managers and systems expose the right orchestration methods and whether any are missing.
- [x] Review whether object classes expose the right movement, bounds, collision, and state access methods.
- [x] Identify APIs that are hard to discover and may need better naming or standardization.
- [x] Capture candidate engine additions separately from bugs so feature gaps stay visible.

## Security and safety review

- [x] Check DOM interaction patterns for unsafe assumptions.
- [x] Review URL and query parameter usage.
- [x] Review asset loading and external resource assumptions.
- [x] Check event listener lifecycle and cleanup.
- [x] Review mutation of shared globals and static state.
- [x] Verify input validation and defensive guards.
- [x] Identify browser/runtime failure risks that should fail safely.

## Performance review

- [x] Add a performance plan with prioritized hotspots and success criteria.
- [x] Remove avoidable work from hot loops (`gameBase.animate`, renderers, collision paths).
- [x] Reduce avoidable allocations in frame/tick paths (object snapshots, polling arrays, debug payloads).
- [x] Replace coarse timing in frame metrics with high-resolution timing where appropriate.
- [.] Validate behavior remains unchanged after perf edits (syntax + smoke checks).
- [x] Document perf changes, expected impact, and deferred items.

Performance review priorities:

- P1: Hot-loop overhead in `engine/core/gameBase.js` (`await` frame path, per-frame random color generation, timing source).
- P1: Debug payload allocation in `engine/renderers/pngRenderer.js` during draw.
- P2: Allocation churn from object list snapshots in `engine/game/gameObjectManager.js` / `engine/game/gameObjectSystem.js`.
- P2: Allocation churn in `engine/input/controller/gamepadManager.js` polling.
- P3: Minor per-call binds and helper allocations in `engine/core/canvas.js`.

Performance review progress:

- P1 `gameBase` hot loop: removed per-frame `Colors.generateRandomColor()` work, switched frame timing from `Date.now()` to `performance.now()`, and removed unconditional `await` from the RAF path by handling async `gameLoop` only when it returns a promise.
- P1 `pngRenderer` debug path: avoided per-frame debug object construction when debug mode is off.
- P2 object system allocations: reduced snapshot churn by adding optional non-snapshot access in `GameObjectManager.getActiveGameObjects(useSnapshot)` and using in-place iteration in `GameObjectSystem.clear()`.
- P2 gamepad polling allocations: replaced `Array.from(...).map(...)` with in-place indexed updates of `this.gameControllers`.
- P3 canvas helper allocations: replaced per-call `.bind(this)` closures in `CanvasUtils.drawNumber/drawText` with stable static callback references.
- Collision path micro-opt: removed per-edge `Math.sqrt(...)` from polygon edge checks by using squared tolerance comparison in `PolygonCollision.isPointInsidePolygon`.
- Vector render path micro-opt: replaced per-draw `forEach` callback allocation with indexed loop in `VectorRenderer.draw`.
- Validation completed so far: `node --check` passed for all modified performance-target files (`gameBase`, `pngRenderer`, `gameObjectManager`, `gameObjectSystem`, `gamepadManager`, `canvas`, `polygonCollision`, `vectorRenderer`).
- Deferred for follow-up: browser smoke/perf profiling pass (frame-time comparison in at least one real game scene such as Asteroids attract/gameplay).

## Basic improvements

- [x] Centralize debug logging policy across engine modules (not just renderers)
- [x] static DEBUG = DebugFlag.has('gamepadManager');
- [x] Remove dead code and obvious duplication where low risk.
- [x] Improve naming and readability where safe.
- [x] Add guard clauses and validation where needed.
- [x] Normalize comment style and lightweight documentation where helpful.
- [x] Make small refactors that improve clarity without changing behavior.

## Unit test audit

- [x] Inventory all existing test files in `engine`.
- [x] Classify tests as Node-safe or browser-dependent.
- [x] Verify current `npm test` coverage against the engine folders.
- [x] Document missing test coverage by folder and module.

## Unit test improvements

- [x] Create or repair unit tests for pure logic modules first.
- [x] Separate browser-only tests from default unit tests where needed.
- [x] Add missing regression tests for bugs found during review.
- [x] Keep the default test suite green after each batch of changes.

## Verification and reporting

- [x] Run relevant tests after each folder review and fix batch.
- [x] Record bugs, architectural risks, security findings, and test gaps by severity.
- [x] Summarize completed fixes and recommended follow-up work.
- [x] Update all documentation
