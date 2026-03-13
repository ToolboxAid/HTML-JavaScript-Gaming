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

Engine surface review results:
  - Added optional runtime context wrapper: `engine/core/runtimeContext.js`, now exposed as `this.runtimeContext` in `GameBase` and passed into `onInitialize(...)`/`gameLoop(...)`.
  - Implemented canonical collision/bounds facade: `engine/game/gameCollision.js`, exposed via `GameObjectSystem.collision` plus convenience delegation methods.

## Security and safety review

- [ ] Check DOM interaction patterns for unsafe assumptions.
- [ ] Review URL and query parameter usage.
- [ ] Review asset loading and external resource assumptions.
- [ ] Check event listener lifecycle and cleanup.
- [ ] Review mutation of shared globals and static state.
- [ ] Verify input validation and defensive guards.
- [ ] Identify browser/runtime failure risks that should fail safely.

## Basic improvements

- [ ] Centralize debug logging policy across engine modules (not just renderers)
- [x] static DEBUG = DebugFlag.has('gamepadManager');
- [ ] Remove dead code and obvious duplication where low risk.
- [ ] Improve naming and readability where safe.
- [ ] Add guard clauses and validation where needed.
- [ ] Normalize comment style and lightweight documentation where helpful.
- [ ] Make small refactors that improve clarity without changing behavior.
- [ ] Centralize debug logging policy across engine modules (not just renderers).

## Unit test audit

- [ ] Inventory all existing test files in `engine`.
- [ ] Classify tests as Node-safe or browser-dependent.
- [ ] Verify current `npm test` coverage against the engine folders.
- [ ] Document missing test coverage by folder and module.

## Unit test improvements

- [ ] Create or repair unit tests for pure logic modules first.
- [ ] Separate browser-only tests from default unit tests where needed.
- [ ] Add missing regression tests for bugs found during review.
- [ ] Keep the default test suite green after each batch of changes.

## Verification and reporting

- [ ] Run relevant tests after each folder review and fix batch.
- [ ] Record bugs, architectural risks, security findings, and test gaps by severity.
- [ ] Summarize completed fixes and recommended follow-up work.
