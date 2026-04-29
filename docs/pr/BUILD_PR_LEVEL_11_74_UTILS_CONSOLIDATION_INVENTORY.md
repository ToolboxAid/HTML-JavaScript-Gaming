# BUILD_PR_LEVEL_11_74_UTILS_CONSOLIDATION_INVENTORY

## Codex Task
Create an analysis-only inventory for the two utility trees:

- `src/shared/utils/*`
- `src/shared/utils/*`

## Steps
1. Recursively list files under both folders.
2. For each JavaScript/TypeScript file, identify exported functions, classes, constants, and default exports.
3. For each export, identify likely dependencies by scanning imports and obvious runtime references.
4. Compare names and implementation similarity across both trees.
5. Classify each item as:
   - `shared-safe`
   - `engine-only`
   - `duplicate-move-to-shared`
   - `duplicate-keep-engine`
   - `needs-review`
6. Write reports:
   - `docs/dev/reports/utils_consolidation_inventory.md`
   - `docs/dev/reports/utils_consolidation_inventory.csv`
7. Add a compact follow-on section listing the exact files/exports recommended for the next consolidation PR.

## Hard Rules
- Do not move files.
- Do not edit imports.
- Do not add alias/pass-through shims.
- Do not create `engine -> shared -> engine` dependency cycles.
- Do not change runtime code except optional report-generation helper scripts if needed.
- Keep output evidence-based.

## Testing
Run targeted syntax/format checks only if report-generation scripts are added.
Do not run the full sample suite.

## Expected Result
A short, actionable inventory that lets the next PR consolidate confirmed common utilities into `src/shared/utils/*` in one pass.
