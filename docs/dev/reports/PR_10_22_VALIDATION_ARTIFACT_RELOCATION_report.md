# PR_10_22_VALIDATION_ARTIFACT_RELOCATION Report

## Scope
Relocated validation artifact JSON files out of `samples/metadata` into `tests/validation`, updated validation consumer paths, and verified runtime/tool code does not consume these artifacts.

## Validation Artifact Relocation

Moved:
- `samples/metadata/samples.runtime.validation.report.json` -> `tests/validation/samples.runtime.validation.report.json`
- `samples/metadata/samples.shared.boundaries.report.json` -> `tests/validation/samples.shared.boundaries.report.json`

Already relocated previously and kept in `tests/validation`:
- `tests/validation/samples.curriculum.validation.json`

Post-relocation `samples/metadata` now contains only runtime metadata SSoT:
- `samples.index.metadata.json`

## Generators / Writers
- Existing dedicated curriculum validation artifact writer already targets test artifacts:
  - `scripts/generate-curriculum-validation-artifact.mjs` -> `tests/validation/samples.curriculum.validation.json`
- No repo generator script was found that writes `samples.runtime.validation.report.json` or `samples.shared.boundaries.report.json` directly.
- Updated validation consumer path in `tests/samples/SamplesProgramCombinedPass.test.mjs` to read boundaries report from `tests/validation`.

## Tool/Runtime Consumption Check
Command:
- `rg -n "samples\.runtime\.validation\.report\.json|samples\.shared\.boundaries\.report\.json|samples\.curriculum\.validation\.json" src tools -S`

Result:
- `NO_MATCH`

Conclusion:
- Runtime/tool code does not consume these validation artifacts as source-of-truth.

## Validation Performed
1. `node --check tests/samples/SamplesProgramCombinedPass.test.mjs`
2. Targeted execution:
   - inline node import run of `tests/samples/SamplesProgramCombinedPass.test.mjs`

## Validation Results
- Syntax check: PASS
- `SamplesProgramCombinedPass`: PASS

## Changed Files
- `tests/validation/samples.runtime.validation.report.json` (new location)
- `tests/validation/samples.shared.boundaries.report.json` (new location)
- `tests/samples/SamplesProgramCombinedPass.test.mjs`
- `docs/pr/BUILD_PR_LEVEL_06_SAMPLES_PROGRAM_COMBINED_PASS.md`
- `docs/dev/reports/PR_10_22_VALIDATION_ARTIFACT_RELOCATION_report.md`

Deleted from old location:
- `samples/metadata/samples.runtime.validation.report.json`
- `samples/metadata/samples.shared.boundaries.report.json`

## Guardrails
- No runtime behavior changes.
- No schema changes.
- No sample implementation changes.
- No `start_of_day` folder changes.
