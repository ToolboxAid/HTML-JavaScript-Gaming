# BUILD_PR_LEVEL_18_18_TRACK_F_DOCS_SYSTEM_COMPLETION_DUPLICATE_MATRIX

## Scope
- Tree scanned: docs/ (excluding docs/dev/start_of_day)
- File types: .md, .txt
- Purpose: identify exact duplicate or overlapping docs candidates for consolidation

## Exact duplicate clusters
1. docs/design/gdd/Capcom/Final Fight/gdd.txt
   docs/design/gdd/Capcom/Marvel_vs_Capcom/gdd.txt
   - Status: unchanged in this PR (outside Track F cleanup scope)
2. docs/operations/dev/templates/CODEX_AUTO_COMMAND.md
   docs/operations/dev/templates/CODEX_ONE_SHOT_COMMAND.md
   - Status: unchanged in this PR (template lane, outside this focused slice)

## Overlapping docs consolidated in this PR
1. docs/dev/codex_commands.md + docs/operations/dev/codex_commands.md
   - Consolidation: operational doc remains authoritative, dev path retained as compatibility pointer.
2. docs/dev/commit_comment.txt + docs/operations/dev/commit_comment.txt
   - Consolidation: operational doc remains authoritative, dev path retained as compatibility pointer.
3. move-only historical cleanup manifests under docs/reports/
   - Consolidation: preserved in docs/reference/features/docs-system/move-history-preserved.md before deletion.

## Outcome
- Duplicate/overlap handling completed for Track F docs-cleanup slice.
