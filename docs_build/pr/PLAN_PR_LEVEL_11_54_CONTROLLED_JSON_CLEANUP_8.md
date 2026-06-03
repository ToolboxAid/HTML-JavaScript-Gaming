# PLAN_PR_LEVEL_11_54_CONTROLLED_JSON_CLEANUP_8

## Purpose
Continue controlled sample JSON cleanup by removing exactly 8 additional unused JSON files confirmed by the audit script.

## Scope
- Run `scripts/PS/audit-sample-json-js-references.ps1`.
- Select exactly 8 `NO` JSON files.
- Each selected file must be tool-specific or debug/utility-specific.
- Validate each selected file manually before removal.
- Remove only files confirmed unused.

## Hard Exclusions
Do not touch:
- `palette.json`
- `tile-map-editor-document.json`
- sample 1902 files
- shared manifests
- files with indirect/manual usage
- any file with ambiguous usage

## Validation Rules
For each selected JSON file:
1. Confirm audit output reports `NO`.
2. Search direct JS references.
3. Search broader repo references.
4. If any doubt exists, keep the file and choose another `NO` item.

## Testing
Targeted validation only.
Do not run the full sample suite unless a shared loader/framework file is changed.

## Acceptance
- Exactly 8 unused JSON files removed.
- No shared or protected files touched.
- Audit rerun shows NO count reduced by 8.
- Targeted validation evidence saved under `docs_build/dev/reports`.
- Roadmap content is not edited except status-only if execution-backed.
