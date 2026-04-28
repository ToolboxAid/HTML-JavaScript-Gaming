# REPORT_PR_10_21_CURRICULUM_VALIDATION_ARTIFACT_LOCATION_AND_PHASE_ORDER_FIX

## Bundle Summary
This PR fixes the validation artifact classification and stale phase order.

## Evidence Basis
Uploaded `samples.curriculum.validation.json` has `progression.phaseOrder` ending at `15`, while the current project expectation is all 19 phases.

## Target Behavior
- Validation artifact lives under test/validation output.
- Phase order includes 01 through 19.
- File is not treated as runtime SSoT.
