# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: low

Apply PR_10_22_VALIDATION_ARTIFACT_RELOCATION.

- Move validation JSON files out of samples/metadata to tests/validation (or docs/dev/reports).
- Update any generators to write to new location.
- Ensure tools do not consume these files.
- Add validation report.
- Return ZIP at tmp/PR_10_22_VALIDATION_ARTIFACT_RELOCATION_delta.zip.
