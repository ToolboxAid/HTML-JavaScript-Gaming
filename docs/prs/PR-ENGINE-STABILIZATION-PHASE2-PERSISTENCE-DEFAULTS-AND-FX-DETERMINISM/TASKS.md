Toolbox Aid
David Quesenberry
03/23/2026
TASKS.md

# TASKS — Engine Stabilization Phase 2: Persistence Defaults + FX Determinism

- [ ] Inspect `engine/persistence/StorageService.js` default behavior
- [ ] Inspect `engine/release/SettingsSystem.js` only if needed for safe persistence composition
- [ ] Remove unsafe implicit storage-global dependency paths
- [ ] Preserve normal browser persistence behavior
- [ ] Inspect randomness usage in `engine/fx/ParticleSystem.js`
- [ ] Add deterministic RNG seam without redesigning FX architecture
- [ ] Preserve default particle behavior for normal runtime use
- [ ] Add focused persistence safety tests under `tests/engine/`
- [ ] Add focused FX determinism tests under `tests/engine/`
- [ ] Update test runner only if required
- [ ] Validate no gameplay tuning or unrelated subsystem changes slipped into this PR
