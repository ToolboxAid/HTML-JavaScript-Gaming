# PLAN_PR_10_27_DUPLICATE_CLASSIFICATION_AND_SAFE_CLEANUP

## Purpose
Classify duplicate-content audit results and perform only safe cleanup of confirmed accidental/SSoT duplicate files.

## Scope
- Use the duplicate audit report from PR 10.26.
- Classify duplicate groups before changing files.
- Remove or demote only confirmed accidental duplicates and duplicate SSoT copies.
- Preserve intentional duplicates, templates, reports, evidence, generated validation outputs, and sample variants unless clearly mislocated.
- Do not modify start_of_day folders.

## Acceptance
- Duplicate groups are classified.
- Safe cleanup is applied only to low-risk confirmed duplicates.
- Runtime SSoT files remain in their canonical locations.
- Ambiguous duplicate groups are documented but not changed.
- Validation report lists all groups and actions.
