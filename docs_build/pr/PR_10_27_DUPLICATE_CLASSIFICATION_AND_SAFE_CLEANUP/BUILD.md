# BUILD_PR_10_27_DUPLICATE_CLASSIFICATION_AND_SAFE_CLEANUP

## Required Codex Work

### 1. Read duplicate audit
Use:
docs_build/dev/reports/repo_duplicate_file_content_audit.json

### 2. Classify groups
Classify each duplicate group as:
- duplicate-ssot
- accidental-copy
- report-evidence
- generated-validation
- template-intentional
- sample-variant-intentional
- ambiguous-no-action

### 3. Safe cleanup rules
Allowed cleanup:
- remove duplicate SSoT copies when canonical live file is clear
- remove accidental duplicate files when unused
- move/demote report evidence only if it looks like runtime source

Do not cleanup:
- templates
- sample variants
- generated reports unless explicitly mislocated
- anything ambiguous

### 4. Validation report
Create:
docs_build/dev/reports/PR_10_27_DUPLICATE_CLASSIFICATION_AND_SAFE_CLEANUP_report.md

Include:
- duplicate groups reviewed
- classification counts
- files removed/moved
- files intentionally kept
- ambiguous groups left untouched
- validation that runtime/tool references still resolve
- confirmation no start_of_day changes

## Constraints
- No broad refactor.
- No automatic delete-all.
- No runtime behavior changes except removing confirmed duplicate confusion.
