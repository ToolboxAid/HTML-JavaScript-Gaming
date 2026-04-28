# PLAN_PR_10_22_VALIDATION_ARTIFACT_RELOCATION

## Purpose
Move validation artifacts out of samples/metadata into a dedicated validation/test location.

## Scope
- Relocate:
  - samples.runtime.validation.report.json
  - samples.shared.boundaries.report.json
  - samples.curriculum.validation.json
- Update any generators to write to the new location.
- Ensure tools do not read these files.

## Acceptance
- Files exist under tests/validation (or docs/dev/reports if repo standard).
- No copies remain under samples/metadata unless required and documented.
- Tools do not reference these files.
