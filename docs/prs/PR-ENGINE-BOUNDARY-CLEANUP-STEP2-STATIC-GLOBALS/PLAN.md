# PLAN_PR - Engine Boundary Cleanup Step 2: Static Globals

## Goal
Audit the requested static/global boundary targets, map them to the live engine modules that now carry those responsibilities, classify each target by ownership fit, and define the smallest safe implementation order without changing runtime behavior in this PR.

## Scope
- Requested targets:
  - `engine/core/canvasUtils.js`
  - `engine/core/fullscreen.js`
  - `engine/core/performanceMonitor.js`
  - `engine/core/timer.js`
  - `engine/events/eventBus.js`
- Live replacements and direct callers under `engine/`, `tests/`, and `samples/`

## Requested Target Status And Classification

| Requested target | Current repo status | Live replacement(s) audited | Classification | Architecture fit | Why |
| --- | --- | --- | --- | --- | --- |
| `engine/core/canvasUtils.js` | Missing | `engine/core/CanvasSurface.js` | `MIXED_SPLIT_REQUIRED` | `MIXED` | The live responsibility mixes DOM canvas/context acquisition with utility methods like `resize`, `clear`, and `size`. That is not a static helper anymore, but it is also not yet an engine-owned injectable boundary. |
| `engine/core/fullscreen.js` | Missing | `engine/runtime/FullscreenService.js` | `INJECTABLE_SERVICE_CANDIDATE` | `GOOD` | The live module already has an injectable `documentRef` and `target`, but it still defaults to `globalThis.document`, so the remaining debt is a default-global seam, not the service shape itself. |
| `engine/core/performanceMonitor.js` | Missing | `engine/core/RuntimeMetrics.js` | `INJECTABLE_SERVICE_CANDIDATE` | `GOOD` | The live module is per-instance mutable state only, has no browser dependency, and is already injected into `Engine` through the constructor. |
| `engine/core/timer.js` | Missing | `engine/core/FrameClock.js`, `engine/core/FixedTicker.js` | `MIXED_SPLIT_REQUIRED` | `GOOD` | The old timer responsibility is already split into two narrower live modules. Recombining them would be backwards; the safe follow-up is integrating the split ownership into `Engine`. |
| `engine/events/eventBus.js` | Case-drift alias on Windows only; committed file is `engine/events/EventBus.js` | `engine/events/EventBus.js` | `INJECTABLE_SERVICE_CANDIDATE` | `GOOD` | The service is instance-owned and browser-free, but the requested lower-case path hides a cross-platform casing hazard that should be treated as boundary debt. |

## Static Global Inventory

### `engine/core/canvasUtils.js` -> `engine/core/CanvasSurface.js`
- Exact boundary findings:
  - `CanvasSurface` requires a real canvas element at construction time in `engine/core/CanvasSurface.js:10-15`.
  - It mutates DOM-owned canvas width and height in `engine/core/CanvasSurface.js:20-23`.
  - It performs drawing-context work directly in `engine/core/CanvasSurface.js:26-27`.
- Shared state:
  - `this.canvas`
  - `this.context`
- Mutable:
  - Yes. `resize()` mutates the DOM element; `clear()` mutates the rendering surface.
- Browser/global dependency:
  - Yes. The module cannot exist without a canvas DOM object.
- Direct callers found:
  - No direct imports or constructor calls found under `engine/`, `tests/`, `samples/`, or `games/`.
- Ownership read:
  - This is orphaned browser adapter debt inside `engine/core/`, not a healthy static utility.

### `engine/core/fullscreen.js` -> `engine/runtime/FullscreenService.js`
- Exact boundary findings:
  - The constructor defaults `documentRef` from `globalThis.document` in `engine/runtime/FullscreenService.js:8`.
  - The service registers browser event listeners in `engine/runtime/FullscreenService.js:31-33` and removes them in `engine/runtime/FullscreenService.js:42-44`.
  - `Engine` constructs the service by default in `engine/core/Engine.js:30` and attaches it in `engine/core/Engine.js:64-66`.
- Shared state:
  - `documentRef`
  - `target`
  - `isActive`
  - `lastError`
  - `isAttached`
- Mutable:
  - Yes, but instance-local.
- Browser/global dependency:
  - Yes, but already isolated behind an injectable service boundary.
- Direct callers found:
  - `engine/core/Engine.js:10,30,64-66,81-82`
  - `tests/final/FullscreenService.test.mjs:8,36-49`
  - `engine/runtime/index.js:8` exports it
- Ownership read:
  - Good service shape; remaining work is removing implicit browser-default access from construction sites.

### `engine/core/performanceMonitor.js` -> `engine/core/RuntimeMetrics.js`
- Exact boundary findings:
  - The module only stores per-instance counters and a snapshot in `engine/core/RuntimeMetrics.js:8-17`.
  - It mutates the rolling window in `engine/core/RuntimeMetrics.js:20-46`.
  - `Engine` constructs it by default in `engine/core/Engine.js:29` and writes frame data in `engine/core/Engine.js:119-125`.
- Shared state:
  - `frameCount`
  - `fixedUpdateCount`
  - `elapsed`
  - `frameTimeTotal`
  - `updateTimeTotal`
  - `renderTimeTotal`
  - `snapshot`
- Mutable:
  - Yes, but instance-local and deterministic.
- Browser/global dependency:
  - No.
- Direct callers found:
  - `engine/core/Engine.js:8,29,119-125`
  - `tests/core/RuntimeMetrics.test.mjs:8,11-19`
- Ownership read:
  - Healthy injectable state holder; low-risk candidate for explicit engine ownership cleanup.

### `engine/core/timer.js` -> `engine/core/FrameClock.js` and `engine/core/FixedTicker.js`
- Exact boundary findings:
  - `FrameClock` still defaults its time source to `performance.now()` in `engine/core/FrameClock.js:10`.
  - `FrameClock` stores mutable wall-clock state in `engine/core/FrameClock.js:14-16,19-31`.
  - `FixedTicker` stores deterministic accumulator state in `engine/core/FixedTicker.js:10-17,19-42`.
  - `Engine` does not use either class yet; instead it owns raw timing state in `engine/core/Engine.js:41-47,68,86-127`.
- Shared state:
  - `FrameClock.lastTimeMs`
  - `FixedTicker.accumulatorMs`
- Mutable:
  - Yes, both are instance-local.
- Browser/global dependency:
  - `FrameClock` has a default global time source.
  - `FixedTicker` has no browser/global dependency.
- Direct callers found:
  - `tests/core/FrameClock.test.mjs:8,11-18`
  - `tests/core/FixedTicker.test.mjs:8,11-24`
  - No runtime callers found under `engine/`, `games/`, or `samples/`
- Ownership read:
  - The split is directionally correct. The actual debt is that `Engine` still reimplements timing instead of owning these injectable primitives.

### `engine/events/eventBus.js` -> `engine/events/EventBus.js`
- Exact boundary findings:
  - The committed file is `engine/events/EventBus.js`, but the requested path only resolves because the current workstation filesystem is case-insensitive.
  - The bus stores shared listener state in `engine/events/EventBus.js:8-9` and mutates it through `on`, `once`, `off`, `emit`, and `clear` in `engine/events/EventBus.js:12-93`.
  - `Engine` owns the service at `engine/core/Engine.js:28`.
- Shared state:
  - `listeners`
- Mutable:
  - Yes, but instance-local.
- Browser/global dependency:
  - No.
- Direct callers found:
  - `engine/core/Engine.js:9,28`
  - `tests/events/EventBus.test.mjs:8,11-26`
  - `tests/world/WorldSystems.test.mjs:8,25-38`
  - `engine/events/index.js:7` exports it
- Direct downstream consumers of the injected service surface:
  - `samples/sample91-event-bus/EventBusScene.js:17-20,34-40,56-61,84-88`
- Ownership read:
  - Good injectable service; the real debt is cross-platform path casing plus broad engine-scene coupling by convention.

## Coupling Map

### Highest-leverage direct caller: `engine/core/Engine.js`
- `engine/core/Engine.js:28` constructs `EventBus`.
- `engine/core/Engine.js:29` constructs `RuntimeMetrics`.
- `engine/core/Engine.js:30` constructs `FullscreenService`.
- `engine/core/Engine.js:64-66` attaches fullscreen listeners.
- `engine/core/Engine.js:119-125` writes runtime metrics.
- `engine/core/Engine.js:41-47,68,86-127` still owns timer state directly instead of delegating to `FrameClock` and `FixedTicker`.

### Test callers
- `tests/final/FullscreenService.test.mjs:36-49` proves `FullscreenService` works with injected document and target doubles.
- `tests/core/RuntimeMetrics.test.mjs:11-19` covers rolling snapshot behavior.
- `tests/core/FrameClock.test.mjs:11-18` covers clamp/reset behavior, but it does not exercise injected `now`.
- `tests/core/FixedTicker.test.mjs:11-24` covers catch-up limits and alpha behavior.
- `tests/events/EventBus.test.mjs:11-26` covers subscription semantics.
- `tests/world/WorldSystems.test.mjs:25-38` uses `EventBus` as an infrastructure dependency for `EventScriptSystem`.

### Sample caller
- `samples/sample91-event-bus/EventBusScene.js:34-40,56-61,84-88` shows scene-level dependence on the engine-owned bus surface rather than direct object wiring.

## Boundary Violations And Test Blockers

### Exact boundary violations
- `CanvasSurface` keeps browser canvas/context ownership in `engine/core/`, which is the wrong layer for DOM-backed adapter state.
- `FullscreenService` still has a hidden browser default in `engine/runtime/FullscreenService.js:8`, even though the service is otherwise injectable.
- `Engine` still owns raw timing globals and loop bookkeeping in `engine/core/Engine.js:41-47,68,86-127` instead of delegating to `FrameClock` and `FixedTicker`.
- `engine/events/eventBus.js` is not the committed filename; the real file is `engine/events/EventBus.js`, which is a non-Windows portability hazard.

### Test blockers
- There is no direct caller coverage for `CanvasSurface`; safe movement or splitting is blocked until we either prove it is dead code or add focused adapter tests.
- `FrameClock` has an injectable seam, but `tests/core/FrameClock.test.mjs:11-18` does not verify a custom `now` source, so the remaining global default is not covered by tests.
- `Engine` has no focused timing-composition test that would let us swap raw loop fields for `FrameClock` and `FixedTicker` with confidence.
- `FullscreenService` has service-level tests, but there is no engine-level test proving attach/detach behavior when `Engine` receives an injected fullscreen service.
- No cross-platform test currently catches casing drift between `eventBus.js` and `EventBus.js`.

## Risk Ranking

| Target | Architectural risk | Testability impact | Migration difficulty | Recommended priority | Why |
| --- | --- | --- | --- | --- | --- |
| `engine/core/timer.js` -> `FrameClock` + `FixedTicker` | High | High | Medium | P0 | `Engine` still duplicates timing state, so timer cleanup unlocks the cleanest static/global reduction in the main loop. |
| `engine/core/fullscreen.js` -> `FullscreenService` | Medium | Medium | Low | P1 | The service is already injectable; the remaining work is mostly removing implicit global defaults and tightening engine composition tests. |
| `engine/core/canvasUtils.js` -> `CanvasSurface` | Medium | High | Medium | P2 | Browser adapter state is in the wrong layer, but no live callers were found, so first we need proof of deadness or a tiny adapter test harness. |
| `engine/events/eventBus.js` -> `EventBus.js` | Medium | Medium | Low | P3 | The service shape is fine; the main follow-up is naming/casing cleanup and documenting engine-owned bus injection. |
| `engine/core/performanceMonitor.js` -> `RuntimeMetrics` | Low | Low | Low | P4 | This is already close to the desired end state and mainly needs explicit composition clarity, not structural change. |

## Smallest Safe Implementation Order

### BUILD_PR 1
`PR-ENGINE-BOUNDARY-CLEANUP-STEP2A-ENGINE-TIME-COMPOSITION`

Safe change set:
- Make `Engine` own a `FrameClock` and `FixedTicker` instead of raw `lastTime` and `accumulator` bookkeeping.
- Keep `FrameClock` and `FixedTicker` as separate modules; do not reintroduce a monolithic `timer.js`.
- Add focused engine-loop tests that prove no behavior change for fixed-step updates and delta clamping.

Why first:
- This removes the biggest remaining static/global-style loop debt from `Engine` without touching browser APIs.

### BUILD_PR 2
`PR-ENGINE-BOUNDARY-CLEANUP-STEP2B-FULLSCREEN-INJECTION`

Safe change set:
- Move `FullscreenService` construction responsibility fully to the engine boundary and avoid relying on the `globalThis.document` default in production call sites.
- Add an engine-level test for `attach()` / `detach()` with an injected fullscreen double.

Why second:
- The service is already close to ideal; this is a narrow cleanup with low surface area.

### BUILD_PR 3
`PR-ENGINE-BOUNDARY-CLEANUP-STEP2C-CANVAS-ADAPTER-OWNERSHIP`

Safe change set:
- First decide whether `CanvasSurface` is dead code.
- If live, move it out of `engine/core/` or split DOM acquisition from convenience methods.
- If dead, remove it in a separate no-behavior-change cleanup PR.

Why third:
- The missing caller map makes this higher uncertainty than the timer/fullscreen passes.

### BUILD_PR 4
`PR-ENGINE-BOUNDARY-CLEANUP-STEP2D-EVENT-BUS-NAMING-AND-OWNERSHIP`

Safe change set:
- Normalize import casing to `EventBus.js`.
- Add a portability test or lint rule that catches case drift.
- Keep the bus injectable and engine-owned; do not convert it into a process-global singleton.

Why fourth:
- The service architecture is already acceptable; the remaining debt is portability and explicit ownership documentation.

### BUILD_PR 5
`PR-ENGINE-BOUNDARY-CLEANUP-STEP2E-METRICS-COMPOSITION-POLISH`

Safe change set:
- Keep `RuntimeMetrics` instance-based.
- If needed, make engine construction explicit in tests and docs, but avoid structural churn.

Why last:
- Lowest risk and lowest urgency.

## No-Behavior-Change Statement
This PR is audit and planning only. It does not modify runtime source files, does not change engine behavior, and only records the current boundary status plus the smallest safe follow-up order supported by the repo as it exists today.
