# PR 11.81 — Utils Audit Expansion

## Purpose
Expand the existing dead-utils audit so Codex reports three things in one pass:

1. unused utility files/exports
2. duplicate or near-duplicate utility exports across utility folders
3. folder-category placement mismatches

This is report-only. Do not delete, move, or rewrite implementation files in this PR.

## Scope
Inspect:

- `src/shared/utils/**`
- any remaining `src/engine/utils/**`
- imports and references across the repo

## Required output
Create:

- `docs/dev/reports/utils_dead_usage_audit.md`
- `docs/dev/reports/utils_duplicate_exports_audit.md`
- `docs/dev/reports/utils_folder_category_audit.md`
- `docs/dev/reports/utils_audit_summary.csv`

## Classification rules

### shared/utils
Allowed:

- pure helpers
- validation helpers
- math helpers
- color helpers
- string/path helpers
- object/array helpers
- no engine runtime dependency

Not allowed:

- canvas/render-loop logic
- game-state coupling
- physics runtime coupling
- input runtime coupling
- sample-specific behavior

### engine/utils
Allowed only when utility is proven engine-runtime specific.

If generic, classify as `move-to-shared`.

## Duplicate rules
Flag:

- same export name in multiple utility files
- same or near-same implementation body
- pass-through wrappers
- alias utilities
- re-export chains used only to preserve old paths

Do not fix them in this PR. Report exact recommended action.

## Acceptance

- Reports exist.
- No implementation files changed.
- Remaining `src/engine/utils/` references are listed.
- Duplicate exports are listed.
- Folder category mismatches are listed.
- Next PR can perform actual cleanup from the reports.
