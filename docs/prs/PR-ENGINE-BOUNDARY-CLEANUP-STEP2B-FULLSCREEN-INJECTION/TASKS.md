Toolbox Aid
David Quesenberry
03/23/2026
TASKS.md

# TASKS — Engine Boundary Cleanup Step 2B: Fullscreen Injection

- [ ] Inspect fullscreen composition in `engine/core/Engine.js`
- [ ] Inspect defaults in `engine/runtime/FullscreenService.js`
- [ ] Remove production reliance on implicit `globalThis.document` fullscreen default path
- [ ] Keep browser fullscreen behavior unchanged
- [ ] Preserve narrow service ownership
- [ ] Add engine-level fullscreen composition tests under `tests/engine/`
- [ ] Exercise attach/detach behavior with an injected fullscreen double or service instance
- [ ] Update test runner only if required
- [ ] Validate no timing/gameplay/canvas/event bus work slipped into this PR
