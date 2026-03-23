Toolbox Aid
David Quesenberry
03/23/2026
TASKS.md

# TASKS — Engine Boundary Cleanup Step 2D: EventBus Naming + Ownership

- [ ] Inspect committed EventBus file path and current imports
- [ ] Normalize imports/usages to `engine/events/EventBus.js`
- [ ] Remove case-drift paths that only work on case-insensitive filesystems
- [ ] Preserve engine-owned injectable EventBus behavior
- [ ] Avoid singleton/global conversion
- [ ] Add focused portability/casing validation if practical
- [ ] Update test runner only if required
- [ ] Validate no timing/fullscreen/canvas/metrics/gameplay work slipped into this PR
