# APPLY PR — Repo Structure Normalization (02) Import Switch

## Purpose
Accept the completed import normalization from `src/engine/` to `src/src/engine/` after successful constrained execution.

## Applied Scope
- Updated import/export/require specifiers only
- `src/engine/...` → `src/src/engine/...`
- Original `src/engine/` directory intentionally retained for rollback safety

## Execution Report
- Files matched and updated: `532`
- Remaining non-`src` `src/engine/` imports in import/export/require statements: `0`
- No file content or logic changes beyond import path strings
- No deletions
- No changes under `src/engine/`

## Acceptance Criteria
- Imports now target `src/src/engine/...`
- Original `src/engine/` mirror remains available
- No logic changes beyond path normalization
- Ready for final cutover PR to remove legacy `src/engine/` directory
