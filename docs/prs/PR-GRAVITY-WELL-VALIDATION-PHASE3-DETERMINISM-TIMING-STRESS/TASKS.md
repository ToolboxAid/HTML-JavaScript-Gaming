Toolbox Aid
David Quesenberry
03/23/2026
TASKS.md

# TASKS — Gravity Well Validation Phase 3: Determinism + Timing Stress

- [ ] Add replay-repeatability tests using the same input script twice
- [ ] Compare resulting world state with explicit tolerance where needed
- [ ] Add coarse-dt vs stepped-dt comparison tests
- [ ] Add tests for win/loss consistency under timing variation
- [ ] Add bounded longer-run stability checks
- [ ] Keep runtime fixes minimal and only if validation fails
- [ ] Update test runner only if required
- [ ] Confirm no engine/promotion/gameplay-expansion work slipped into this PR
