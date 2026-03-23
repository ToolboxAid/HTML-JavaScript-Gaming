Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Engine Stabilization Phase 2: Persistence Defaults + FX Determinism

## Goal
Stabilize remaining browser-default persistence seams and add deterministic control to engine FX behavior while preserving runtime behavior.

## In Scope
- `engine/persistence/StorageService.js`
- `engine/release/SettingsSystem.js` only if required for safe composition
- `engine/fx/ParticleSystem.js`
- focused tests under `tests/engine/`
- `tests/run-tests.mjs` only if required

## Out of Scope
- scene lifecycle changes
- transition rendering changes
- Asteroids extraction/promotions
- broad storage redesign
- broad particle/FX redesign
- gameplay tuning changes

## Required Changes

### 1. Persistence default safety
Harden `StorageService` so engine-level behavior does not depend on unsafe implicit browser globals in non-browser contexts.

Preserve normal browser behavior while ensuring:
- safe behavior when browser storage is unavailable
- clearer composition/default handling for tests and non-browser execution
- no crash path from missing storage globals

If needed, adjust `SettingsSystem` only enough to keep composition safe and behavior unchanged.

### 2. FX determinism seam
Add deterministic control to `ParticleSystem` without redesigning the FX system.

Requirements:
- allow RNG injection or equivalent deterministic seam
- preserve current default runtime behavior in normal gameplay
- support deterministic tests where particle randomness must be reproducible

### 3. Preserve behavior
Preserve:
- browser persistence behavior in normal supported runtime
- current particle/FX visible behavior when using default runtime configuration
- existing public behavior outside the new determinism/safety seam

### 4. Focused tests
Add focused tests that prove:
- `StorageService` behaves safely when storage is unavailable
- persistence/default composition remains stable
- `ParticleSystem` supports deterministic random behavior when controlled
- default runtime behavior still works without requiring callers to change usage

## Acceptance Criteria
- persistence no longer has unsafe implicit browser dependency at engine level
- ParticleSystem has a deterministic seam
- focused persistence and FX tests are present
- no unrelated subsystems are changed
