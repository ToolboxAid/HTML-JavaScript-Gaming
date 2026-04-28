# PLAN_PR_10_21_CURRICULUM_VALIDATION_ARTIFACT_LOCATION_AND_PHASE_ORDER_FIX

## Purpose
Move curriculum validation output into a test/validation directory and correct phase ordering to include all 19 phases.

## Problem
`samples.curriculum.validation.json` is validation/test output, but it is not clearly located as a test artifact. Its `progression.phaseOrder` currently stops at phase `15`, while the repo curriculum now has 19 phases.

## Scope
- Validation artifact location only.
- Curriculum validation generation/output path only if a generator exists.
- Correct `progression.phaseOrder` to include phases `01` through `19`.
- Keep the file as validation evidence, not runtime sample data.
- Do not modify sample implementation code.
- Do not modify start_of_day folders.

## Acceptance
- `samples.curriculum.validation.json` lives under an explicit test/validation artifact path.
- Any generator/script writes the file to that test/validation path.
- `progression.phaseOrder` includes `01` through `19`.
- Runtime sample/tool code does not depend on this validation artifact as SSoT data.
- Report confirms old path, new path, and phase list.
