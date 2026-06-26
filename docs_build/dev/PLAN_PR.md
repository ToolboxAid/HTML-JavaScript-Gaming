# PLAN_PR: PR_26177_002-shared-noise-foundation

## Purpose

Add a small shared deterministic noise foundation.

## Scope

- Add `src/shared/noise/` foundation.
- Build on existing `RandomSeed` and PR_001 hash utilities.
- Include deterministic Value, Perlin-style, Simplex-style, and Fractal-style helpers where practical.
- Keep API small and documented.
- Add targeted tests.
- No browser-owned product data.
- No runtime UI changes.
- No unrelated cleanup.

## Implementation Plan

1. Add `src/shared/noise/noise.js`.
2. Add `tests/shared/NoiseFoundation.test.mjs`.
3. Validate deterministic output, seed variation, practical ranges, and permutation determinism.
4. Produce required Codex reports and repo-structured ZIP.
