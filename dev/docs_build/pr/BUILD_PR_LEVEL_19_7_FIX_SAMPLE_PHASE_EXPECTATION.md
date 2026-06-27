# BUILD_PR_LEVEL_19_7_FIX_SAMPLE_PHASE_EXPECTATION

## Purpose
Fix failing validation blocker:
SamplesProgramCombinedPass.test expects phase-01..15 but repo now includes phase-16..19.

## Scope
- Single purpose PR: fix sample phase expectation mismatch
- Test + expectation alignment only
- No feature work

## Required Change
Update:
tests/samples/SamplesProgramCombinedPass.test.mjs

Replace:
expected phases = phase-01..phase-15

With:
dynamic or explicit inclusion of:
phase-01..phase-19

## Validation
Run:
- node ./scripts/run-node-tests.mjs
EXPECT:
- SamplesProgramCombinedPass passes

## Acceptance
- Test suite passes this test
- No regressions introduced
- Unlocks multiple Level 19 tracks
