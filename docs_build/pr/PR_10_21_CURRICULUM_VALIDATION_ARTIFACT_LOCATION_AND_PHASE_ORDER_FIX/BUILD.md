# BUILD_PR_10_21_CURRICULUM_VALIDATION_ARTIFACT_LOCATION_AND_PHASE_ORDER_FIX

## Required Codex Work

### 1. Locate artifact ownership
Find where `samples.curriculum.validation.json` is stored and, if applicable, generated.

### 2. Move validation output
Move the file to an explicit test/validation artifact location, such as:
- `tests/validation/samples.curriculum.validation.json`
or the existing repo test artifact folder if one already exists.

Do not leave a duplicate runtime copy unless required by an existing test harness. If a compatibility copy is unavoidable, document why.

### 3. Correct phaseOrder
Update:
`progression.phaseOrder`

It must contain all 19 phases:
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

### 4. Runtime separation
Confirm no runtime sample/tool data flow treats this validation file as source-of-truth. It is a validation artifact only.

### 5. Validation report
Create:
docs_build/dev/reports/PR_10_21_CURRICULUM_VALIDATION_ARTIFACT_LOCATION_AND_PHASE_ORDER_FIX_report.md

Report must include:
- old file path
- new file path
- whether a generator/script was updated
- final phaseOrder list
- confirmation the file is not runtime SSoT
- confirmation no start_of_day changes

## Constraints
- Smallest scoped valid change.
- No unrelated sample index rebuild unless required by the validation generator.
- No sample implementation changes.
- No roadmap text rewrite.
