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
- [ ] Check whether singular vs plural naming is used consistently.
- [x] Review whether folder boundaries encourage good reuse or create confusion.
- [x] Identify top-level files that should move into a more specific engine subfolder.

File placement review results:

- Kept top-level compatibility re-export shims for `engine/gameObject*.js` to preserve existing game imports.
- Updated game-domain test imports to target canonical `engine/game/` module locations.
- Remaining candidate moves (defer to naming pass): `colors.js`, `font5x6.js`, `palettes.js`, `palettesList.js` closer to `core`/render assets grouping.

Naming consistency review results:

- Normalized typo/casing hotspots in core modules (`dimensions`, `currentScrollPosX`, `spamSprite2RGB`, and inheriting wording in abstract errors).
- Verified keyboard input API call sites now consistently use `getKeysPressed`.
- File/class casing style is mostly consistent (`camelCase.js` file names with PascalCase classes for class modules).
- Remaining naming candidates (separate pass): clarify asset-module grouping names (`colors`, `font5x6`, `palettes`, `palettesList`) and evaluate whether `misc` should become a more specific domain name.

Ambiguous/outdated/misleading name review results:

- Renamed message example scripts from ambiguous `testSender.js`/`testReceiver.js` to explicit `messages/examples/senderExample.js` and `messages/examples/receiverExample.js`.
- Fixed stale/overly verbose import paths in `messages/eventBus.js` and `messages/receiver.js` to direct local imports.
- Corrected misleading header comment in `messages/eventBus.js` (`.js` -> `eventBus.js`).
- Remaining ambiguous names for dedicated rename pass: `misc` folder scope, `runTest.js` filename vs exported `runTests`, and legacy sprite metadata keys like `spriteimage`/`framesPerSprite` used by editor JSON schema.

## Architecture review

- [ ] Evaluate module boundaries and shared abstractions.
- [ ] Check for circular dependencies and hidden coupling.
- [ ] Review naming consistency and API ergonomics.
- [ ] Evaluate separation of concerns across engine layers.
- [ ] Review inheritance vs composition choices.
- [ ] Verify inheritance chains are shallow, intentional, and not carrying unrelated responsibilities.
- [ ] Check whether subclasses truly satisfy parent contracts without surprising behavior.
- [ ] Review ownership of data and state across modules, classes, and systems.
- [ ] Verify that each piece of mutable state has a clear owner.
- [ ] Identify shared mutable objects that should be isolated, copied, or encapsulated.
- [ ] Review where state should live: object instance, manager, system, config, or runtime context.
- [ ] Check lifecycle ownership for created resources such as listeners, timers, assets, and child objects.
- [ ] Verify destroy/cleanup responsibilities are clearly owned and consistently enforced.
- [ ] Review whether APIs expose too much internal state or allow unsafe mutation.
- [ ] Identify unstable or overly broad engine APIs.

## Engine surface review

- [ ] Identify which core engine classes should exist and whether any are missing.
- [ ] Review whether current engine classes have clear responsibilities and useful boundaries.
- [ ] Identify methods that should exist on core classes for consistency and usability.
- [ ] Check for duplicated behavior that should be promoted into shared engine classes or helpers.
- [ ] Review whether base classes define the right default lifecycle methods such as `init`, `update`, `draw`, `destroy`, `reset`, or `validate`.
- [ ] Check whether managers and systems expose the right orchestration methods and whether any are missing.
- [ ] Review whether object classes expose the right movement, bounds, collision, and state access methods.
- [ ] Identify APIs that are hard to discover and may need better naming or standardization.
- [ ] Capture candidate engine additions separately from bugs so feature gaps stay visible.

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
- [ ] static DEBUG = new URLSearchParams(window.location.search).has('gamepadManager');
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
