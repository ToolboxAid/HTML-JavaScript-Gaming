Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Engine Stabilization Phase 2 (Persistence Defaults + FX Determinism)

## Purpose
Implement the second stabilization pass after scene lifecycle and transition seam cleanup.

## Goal
Reduce browser-default persistence risk and make engine FX behavior more deterministic and testable.

## Scope
- `engine/persistence/StorageService.js`
- related persistence/default call sites only if required
- `engine/release/SettingsSystem.js` only if required for safe default handling
- `engine/fx/ParticleSystem.js`
- focused persistence and FX determinism tests
- `tests/run-tests.mjs` only if required

## Constraints
- No gameplay tuning changes
- No scene lifecycle work in this PR
- No Asteroids extraction work in this PR
- No broad persistence redesign
- No broad FX system redesign
- Preserve current browser behavior for normal usage

## Expected Outcome
- persistence defaults no longer rely on unsafe implicit browser assumptions in engine-level behavior
- particle/effect randomness can be controlled for deterministic tests where appropriate
- focused tests prove storage-absence safety and FX determinism seams
