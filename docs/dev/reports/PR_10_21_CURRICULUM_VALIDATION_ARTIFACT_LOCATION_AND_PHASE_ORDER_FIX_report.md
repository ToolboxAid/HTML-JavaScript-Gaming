# PR_10_21_CURRICULUM_VALIDATION_ARTIFACT_LOCATION_AND_PHASE_ORDER_FIX Report

## Scope
Moved `samples.curriculum.validation.json` into an explicit test/validation artifact location, corrected `progression.phaseOrder` to phases `01` through `19`, and updated test/generation wiring to use the new location.

## Artifact Location
- Old path: `samples/metadata/samples.curriculum.validation.json`
- New path: `tests/validation/samples.curriculum.validation.json`

## Generator/Script Update
- Added generator script: `scripts/generate-curriculum-validation-artifact.mjs`
- Added npm script entry: `build:curriculum-validation-artifact`
- Generator now writes curriculum validation artifact to `tests/validation/samples.curriculum.validation.json`.
- Updated consumer test path in `tests/samples/SamplesProgramCombinedPass.test.mjs` to read from `tests/validation`.

## Phase Order Fix
Final `progression.phaseOrder`:
- `01`
- `02`
- `03`
- `04`
- `05`
- `06`
- `07`
- `08`
- `09`
- `10`
- `11`
- `12`
- `13`
- `14`
- `15`
- `16`
- `17`
- `18`
- `19`

## Runtime Separation Confirmation
Search performed across runtime/sample/tool code paths:
- command: `rg -n "samples\.curriculum\.validation\.json|curriculum\.validation" src tools samples scripts -S`
- result: references exist only in the new generator script; no runtime sample/tool data flow depends on this file as source-of-truth.

## Additional Consistency Adjustment
- Updated `progression.totalSamples` in the moved artifact to match `samples/metadata/samples.index.metadata.json` current count (`256`) so existing curriculum progression checks remain coherent.

## Validation Performed
1. `node --check scripts/generate-curriculum-validation-artifact.mjs`
2. `node --check tests/samples/SamplesProgramCombinedPass.test.mjs`
3. `node ./scripts/generate-curriculum-validation-artifact.mjs`
4. `node -` inline import run for `tests/samples/SamplesProgramCombinedPass.test.mjs`

## Validation Results
- Syntax checks: PASS
- Artifact generation to new path: PASS
- `SamplesProgramCombinedPass`: PASS

## Changed Files
- `tests/validation/samples.curriculum.validation.json` (new, relocated artifact)
- `samples/metadata/samples.curriculum.validation.json` (removed)
- `tests/samples/SamplesProgramCombinedPass.test.mjs`
- `scripts/generate-curriculum-validation-artifact.mjs` (new)
- `package.json`
- `docs/pr/BUILD_PR_LEVEL_06_SAMPLES_PROGRAM_COMBINED_PASS.md`
- `docs/dev/reports/PR_10_21_CURRICULUM_VALIDATION_ARTIFACT_LOCATION_AND_PHASE_ORDER_FIX_report.md`

## Guardrails
- No sample implementation code changes.
- No `start_of_day` folder changes.
