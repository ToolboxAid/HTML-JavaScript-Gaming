# BUILD_PR_PUBLIC_PLATFORM_SHOWCASE

## Purpose
Build the final public-facing showcase package for the vector-native platform using only verified technical evidence from the accepted runtime, sample-game, and geometry-runtime states.

## Governing Contract
- `docs/pr/PLAN_PR_PUBLIC_PLATFORM_SHOWCASE.md`

## Verified Inputs
- Asteroids vector-only runtime:
  - `status=ready`
  - `validation=valid`
  - `package=ready`
  - `runtime=ready`
  - `debug=ready`
  - `profiler=ready`
  - `export=ready`
  - `publishing=ready`
  - no active `sprite.asteroids-demo` runtime dependency
- Vector-native template sample game:
  - `status=ready`
  - `validation=valid`
  - `package=ready`
  - `runtime=ready`
  - `debug=ready`
  - `profiler=ready`
  - `publishing=ready`
  - no active sprite fallback dependency
- Deterministic vector geometry runtime:
  - repeated runs stable
  - debug output shows geometry participation
  - profiler output shows geometry participation
- Platform verification:
  - `node ./scripts/run-node-tests.mjs`
  - result: `110/110` explicit `run()` tests passed

## Release-Ready Assets Created
- `docs/release/public_platform_showcase_summary.md`
- `docs/release/public_platform_showcase_video_plan.md`
- `docs/release/public_platform_showcase_overlays.txt`
- `docs/release/public_platform_showcase_proof_checklist.md`

## Showcase Structure
1. Title card: identify the platform as a verified vector-native game platform.
2. Flagship gameplay: show the Asteroids demo title-to-gameplay loop.
3. Game-over loop: show restart-ready gameplay continuity.
4. Debug proof: surface graph/runtime/debug readiness.
5. Profiler proof: surface deterministic geometry participation.
6. Template proof: call out the standalone sample as template reuse evidence.
7. Close card: summarize validation, packaging, runtime, export, and publishing readiness.

## Claims Guardrail
- Allowed claims are limited to verified repo evidence from the current runtime/build outputs.
- The showcase must not claim multiplayer, AI gameplay authorship, or engine redesign work as part of this release path.
- The showcase must not imply sprite fallback remains active.
- The showcase must not imply geometry runtime replaces authored vector assets as source truth.

## Validation Performed
- Read and applied `PLAN_PR_PUBLIC_PLATFORM_SHOWCASE.md`.
- Re-verified Asteroids vector-only runtime readiness from live shared build output.
- Re-verified vector-native template sample-game readiness from live shared build output.
- Re-verified deterministic vector geometry runtime output and reporting visibility from live shared build output.
- Re-ran `node ./scripts/run-node-tests.mjs` with `110/110` explicit `run()` tests passing.

## Result
- The public-facing showcase plan and release-ready assets are aligned to current verified technical evidence.
- No engine core APIs were changed.
