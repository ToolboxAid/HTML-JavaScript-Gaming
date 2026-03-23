Toolbox Aid
David Quesenberry
03/23/2026
TASKS.md

# TASKS — Engine Boundary Cleanup Step 2A: Engine Time Composition

- [ ] Inspect current timing state in `engine/core/Engine.js`
- [ ] Replace raw frame timing bookkeeping with `FrameClock` composition
- [ ] Replace raw accumulator/fixed-step bookkeeping with `FixedTicker` composition
- [ ] Keep `FrameClock` and `FixedTicker` as separate modules
- [ ] Preserve delta clamp behavior
- [ ] Preserve fixed-step catch-up behavior
- [ ] Preserve update/render ordering
- [ ] Add engine-level timing composition tests under `tests/engine/`
- [ ] Update test runner only if required
- [ ] Validate no gameplay behavior changes
- [ ] Validate no unrelated architectural changes were made
