# BUILD_PR_10_22_VALIDATION_ARTIFACT_RELOCATION

## Required Codex Work

1. Move files from:
   samples/metadata/

   to:
   tests/validation/   (preferred)
   OR docs_build/dev/reports/ (if repo standard requires)

2. Update any scripts/generators to output to the new location.

3. Verify no runtime/tool code references these files.

4. Add validation report:
   docs_build/dev/reports/PR_10_22_VALIDATION_ARTIFACT_RELOCATION_report.md

## Constraints
- No runtime behavior changes
- No schema changes
- No sample changes
