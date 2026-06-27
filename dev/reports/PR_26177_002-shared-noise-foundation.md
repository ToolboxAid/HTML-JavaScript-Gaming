# PR_26177_002-shared-noise-foundation

Date: 2026-06-26
Scope: Shared deterministic noise foundation
Status: PASS

## Summary

- Added `src/shared/noise/noise.js`.
- Added deterministic value, Perlin-style, Simplex-style, fractal, and seeded permutation helpers.
- Built on PR_001 hash utilities and existing `RandomSeed`.
- Added targeted tests in `tests/shared/NoiseFoundation.test.mjs`.
- No browser-owned product data, runtime UI, API, database, or unrelated cleanup changes were made.

## Validation

- PASS: `node ./scripts/run-node-test-files.mjs tests/shared/NoiseFoundation.test.mjs tests/shared/HashFoundation.test.mjs`.
- PASS: `node --check src/shared/noise/noise.js`.
- PASS: `node --check tests/shared/NoiseFoundation.test.mjs`.
- PASS: `git diff --check`.

## Artifact

- `tmp/PR_26177_002-shared-noise-foundation_delta.zip`
