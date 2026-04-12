# SpriteEditor Archive Move Report

Generated: 2026-04-12

## Move Summary
- Source: tools/SpriteEditor_old_keep/
- Destination: docs/archive/tools/SpriteEditor_old_keep/
- Files moved: 44
- Source path exists after move: no
- Destination path exists after move: yes

## Content Preservation
- Structure and file contents were preserved by direct directory move (Move-Item) with no content edits under the moved tree.
- File count before move: 44
- File count after move: 44

## Documentation Reference Updates
- Docs path replacements applied: 14 files
- docs/dev/reports/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE_report.md
- docs/dev/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1_report.md
- docs/dev/reports/BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1_validation.md
- docs/dev/reports/BUILD_PR_TOOLS_THEME_REUSE_BASELINE_changes.md
- docs/dev/reports/BUILD_PR_TOOLS_THEME_REUSE_BASELINE_validation.md
- docs/dev/reports/cleanup_keep_move_future_delete_matrix.md
- docs/dev/reports/cleanup_live_reference_inventory.txt
- docs/dev/reports/cleanup_target_enforcement_map.md
- docs/dev/reports/cleanup_target_normalization_report.md
- docs/dev/reports/tools_shared_inventory.txt
- docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1.md
- docs/pr/BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1.md
- docs/pr/BUILD_PR_TOOLS_THEME_REUSE_BASELINE.md
- docs/dev/reports/launch_smoke_report.md

## Documentation Notes
- Command/spec files that intentionally describe source and destination paths retain source-path mentions by design:
  - docs/dev/codex_commands.md
  - docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_4B_SPRITEEDITOR_MOVE_TO_ARCHIVE.md

## Runtime Impact Check
- Runtime wiring files were not modified.
- Runtime import/require/dynamic-import scan for SpriteEditor_old_keep in tools/src/games/samples/tests: no matches.
- Active tools launch smoke:
  - Command: npm run test:launch-smoke -- --tools
  - Result: PASS 11/11 tools, FAIL 0

## Broken Reference Scan
- Old path no longer exists: PASS
- New archive path exists: PASS
- Docs non-archive path references were updated where needed for active reports/specs.
- Remaining non-doc references to SpriteEditor_old_keep exist in legacy metadata/baseline files and runtime registry metadata by design under the no-runtime-wiring constraint.

## Commands Used
- Move-Item -LiteralPath tools/SpriteEditor_old_keep -Destination docs/archive/tools/SpriteEditor_old_keep
- rg -n -P (?<!docs/archive/)tools/SpriteEditor_old_keep docs --glob !docs/archive/**
- rg import/require patterns for SpriteEditor_old_keep across tools src games samples tests
- npm run test:launch-smoke -- --tools
