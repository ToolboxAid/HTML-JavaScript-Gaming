# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_10_27_DUPLICATE_CLASSIFICATION_AND_SAFE_CLEANUP.

Required:
- Read docs/dev/reports/repo_duplicate_file_content_audit.json from PR 10.26.
- Classify duplicate groups before cleanup.
- Remove/demote only confirmed duplicate SSoT or accidental-copy files.
- Do not delete templates, sample variants, generated reports, validation outputs, or ambiguous groups.
- Leave ambiguous groups documented with no action.
- Add report at docs/dev/reports/PR_10_27_DUPLICATE_CLASSIFICATION_AND_SAFE_CLEANUP_report.md.
- Do not modify start_of_day folders.
- Return ZIP artifact at tmp/PR_10_27_DUPLICATE_CLASSIFICATION_AND_SAFE_CLEANUP_delta.zip.
