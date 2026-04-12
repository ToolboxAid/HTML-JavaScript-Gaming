# BUILD_PR_TARGETED_REPO_CLEANUP_PASS_6_CLASSES_OLD_KEEP_REFERENCE_NORMALIZATION

## PR Purpose
Normalize all documentation references to `classes_old_keep (docs-only placeholder, no on-disk path)` into a consistent, explicit "docs-only placeholder" terminology.

## Scope
Docs-only normalization. No structural or runtime changes.

## Required Work
1. Update references in docs to use consistent phrase:
   "classes_old_keep (docs-only placeholder, no on-disk path)"
2. Do NOT remove references
3. Do NOT create folder
4. Do NOT touch templates/, docs/archive/, or runtime code

## Deliverables
- normalization_report.md
- BUILD report
- validation checklist
