# BUILD_PR_LEVEL_19_4_PERFORMANCE_SCALING_ROADMAP_PROMOTION Validation Blockers

- `npm test` failed at pretest `tools/dev/checkSharedExtractionGuard.mjs` with `baseline_unexpected=288`
- `node ./scripts/run-node-tests.mjs` failed at `tests/samples/SamplesProgramCombinedPass.test.mjs` because expectations stop at `phase-15` while runtime includes `phase-16` through `phase-19`
- `npm run test:launch-smoke` passed
