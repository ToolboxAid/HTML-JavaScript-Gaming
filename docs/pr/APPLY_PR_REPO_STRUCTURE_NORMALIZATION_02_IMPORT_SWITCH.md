# APPLY PR — Repo Structure Normalization (02) Import Switch

## Purpose
Accept the completed import normalization from `engine/` to `src/engine/` after successful constrained execution.

## Applied Scope
- Updated import/export/require specifiers only
- `engine/...` → `src/engine/...`
- Original `engine/` directory intentionally retained for rollback safety

## Execution Report
- Files matched and updated: `532`
- Remaining non-`src` `engine/` imports in import/export/require statements: `0`
- No file content or logic changes beyond import path strings
- No deletions
- No changes under `engine/`

## Acceptance Criteria
- Imports now target `src/engine/...`
- Original `engine/` mirror remains available
- No logic changes beyond path normalization
- Ready for final cutover PR to remove legacy `engine/` directory
