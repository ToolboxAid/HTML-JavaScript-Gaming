# BUILD_PR_LEVEL_18_18_TRACK_F_DOCS_SYSTEM_COMPLETION_DELETION_MAP

## Rule
Delete only move-only historical docs after content preservation.

## Preservation destination
- docs/reference/features/docs-system/move-history-preserved.md

## Deleted files
1. docs_build/reports/cleanup_keep_move_future_delete_matrix.md
2. docs_build/reports/docs_archive_pr_keep_manifest.txt
3. docs_build/reports/docs_archive_pr_move_manifest.txt
4. docs_build/reports/docs_path_cleanup_plan.txt
5. docs_build/reports/migration_map.txt
6. docs_build/reports/move_map.txt
7. docs_build/reports/overlay/MOVE_CLEANUP_MANIFEST_LEVEL_18_6.md
8. docs_build/reports/roadmap_move_manifest.txt
9. docs_build/reports/spriteeditor_archive_move_report.md
10. docs_build/reports/spriteeditor_archive_move_validation.md
11. docs_build/reports/starter_project_template_move_report.md
12. docs_build/reports/templates_vector_native_active_relocation_report.md
13. docs_build/reports/templates_vector_native_active_relocation_validation.md

## Validation
- Each deleted source appears as a preserved-source section in move-history-preserved.md.
- No deleted-path references remain in docs/ except preserved-source provenance blocks.
