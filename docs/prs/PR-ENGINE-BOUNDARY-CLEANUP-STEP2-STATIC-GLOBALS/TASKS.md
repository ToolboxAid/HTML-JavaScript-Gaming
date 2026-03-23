# TASKS - Engine Boundary Cleanup Step 2: Static Globals

## Audit Completion
- [x] Confirm the requested legacy targets against the current repo layout
- [x] Map `engine/core/canvasUtils.js` to `engine/core/CanvasSurface.js`
- [x] Map `engine/core/fullscreen.js` to `engine/runtime/FullscreenService.js`
- [x] Map `engine/core/performanceMonitor.js` to `engine/core/RuntimeMetrics.js`
- [x] Map `engine/core/timer.js` to `engine/core/FrameClock.js` and `engine/core/FixedTicker.js`
- [x] Confirm the committed event bus file is `engine/events/EventBus.js`, with lower-case `eventBus.js` only resolving on case-insensitive filesystems
- [x] Identify direct callers under `engine/`, `tests/`, and `samples/`
- [x] Classify each target and record architecture fit
- [x] Document exact boundary violations and test blockers
- [x] Confirm this PR is docs-only with no runtime source edits

## Smallest Safe Follow-Up Order
- [ ] BUILD_PR 1: Replace `Engine` raw loop timing state with `FrameClock` and `FixedTicker` composition
- [ ] BUILD_PR 1: Add engine-loop tests covering delta clamping and fixed-step catch-up behavior
- [ ] BUILD_PR 2: Remove reliance on `FullscreenService`'s `globalThis.document` default from engine construction paths
- [ ] BUILD_PR 2: Add an engine-level fullscreen attach/detach composition test
- [ ] BUILD_PR 3: Prove whether `CanvasSurface` is live or dead before moving, splitting, or deleting it
- [ ] BUILD_PR 3: If `CanvasSurface` is live, move or split it so DOM-backed canvas ownership is not parked in `engine/core/`
- [ ] BUILD_PR 4: Normalize event bus import casing to `EventBus.js` and add a portability guard for case drift
- [ ] BUILD_PR 5: Leave `RuntimeMetrics` instance-based and only do composition polish if later engine cleanup still needs it
