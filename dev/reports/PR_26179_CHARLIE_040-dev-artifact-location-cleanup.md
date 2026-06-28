# PR_26179_CHARLIE_040-dev-artifact-location-cleanup

Team: CHARLIE

Base branch: PR_26179_CHARLIE_039-sprites-color-and-zoom-fix

Branch: PR_26179_CHARLIE_040-dev-artifact-location-cleanup

## Scope

Development artifact location cleanup only. No runtime behavior, Sprite Editor functionality, DB/API/schema, or start_of_day files were changed.

## Project Instructions Read

- dev/build/ProjectInstructions/addendums/batch_governance_mode.md
- dev/build/ProjectInstructions/repository/canonical_repository_structure.md
- dev/build/ProjectInstructions/addendums/codex_artifact_and_reporting_standard.md
- dev/build/ProjectInstructions/addendums/documentation_ownership.md

## Canonical Artifact Mapping

| Legacy path | Canonical path | Action |
| --- | --- | --- |
| docs_build/dev/reports/PR_26179_CHARLIE_0*.md | dev/reports/PR_26179_CHARLIE_0*.md | Moved generated Charlie Sprite PR reports |
| docs_build/dev/reports/codex_changed_files.txt | dev/reports/codex_changed_files.txt | Removed legacy tracked copy; regenerated canonical report |
| docs_build/dev/reports/codex_review.diff | dev/reports/codex_review.diff | Removed legacy tracked copy; regenerated canonical diff |
| dev/workspace/zip/ | dev/workspace/zips/ | Updated Charlie Sprite report references to canonical ZIP path |

Canonical ZIP path confirmed from current Project Instructions: dev/workspace/zips/

## Files Moved

- docs_build/dev/reports/PR_26179_CHARLIE_022-sprites-tool-shell.md -> dev/reports/PR_26179_CHARLIE_022-sprites-tool-shell.md
- docs_build/dev/reports/PR_26179_CHARLIE_023-sprites-toolbar-placeholders.md -> dev/reports/PR_26179_CHARLIE_023-sprites-toolbar-placeholders.md
- docs_build/dev/reports/PR_26179_CHARLIE_024-sprites-canvas-grid.md -> dev/reports/PR_26179_CHARLIE_024-sprites-canvas-grid.md
- docs_build/dev/reports/PR_26179_CHARLIE_025-sprites-basic-drawing.md -> dev/reports/PR_26179_CHARLIE_025-sprites-basic-drawing.md
- docs_build/dev/reports/PR_26179_CHARLIE_026-sprites-palette-panel.md -> dev/reports/PR_26179_CHARLIE_026-sprites-palette-panel.md
- docs_build/dev/reports/PR_26179_CHARLIE_027-sprites-preview-export.md -> dev/reports/PR_26179_CHARLIE_027-sprites-preview-export.md
- docs_build/dev/reports/PR_26179_CHARLIE_028-sprites-editor-polish.md -> dev/reports/PR_26179_CHARLIE_028-sprites-editor-polish.md
- docs_build/dev/reports/PR_26179_CHARLIE_029-sprites-clear-reset-controls.md -> dev/reports/PR_26179_CHARLIE_029-sprites-clear-reset-controls.md
- docs_build/dev/reports/PR_26179_CHARLIE_030-sprites-undo-redo.md -> dev/reports/PR_26179_CHARLIE_030-sprites-undo-redo.md
- docs_build/dev/reports/PR_26179_CHARLIE_031-sprites-picker-zoom.md -> dev/reports/PR_26179_CHARLIE_031-sprites-picker-zoom.md
- docs_build/dev/reports/PR_26179_CHARLIE_032-sprites-shape-tools.md -> dev/reports/PR_26179_CHARLIE_032-sprites-shape-tools.md
- docs_build/dev/reports/PR_26179_CHARLIE_033-sprites-canvas-preview-sync.md -> dev/reports/PR_26179_CHARLIE_033-sprites-canvas-preview-sync.md
- docs_build/dev/reports/PR_26179_CHARLIE_034-sprites-frame-strip.md -> dev/reports/PR_26179_CHARLIE_034-sprites-frame-strip.md
- docs_build/dev/reports/PR_26179_CHARLIE_035-sprites-frame-editing.md -> dev/reports/PR_26179_CHARLIE_035-sprites-frame-editing.md
- docs_build/dev/reports/PR_26179_CHARLIE_036-sprites-animation-preview.md -> dev/reports/PR_26179_CHARLIE_036-sprites-animation-preview.md
- docs_build/dev/reports/PR_26179_CHARLIE_037-sprites-animation-export.md -> dev/reports/PR_26179_CHARLIE_037-sprites-animation-export.md
- docs_build/dev/reports/PR_26179_CHARLIE_038-sprites-grid-dimension-fix.md -> dev/reports/PR_26179_CHARLIE_038-sprites-grid-dimension-fix.md
- docs_build/dev/reports/PR_26179_CHARLIE_039-sprites-color-and-zoom-fix.md -> dev/reports/PR_26179_CHARLIE_039-sprites-color-and-zoom-fix.md

## References Updated

- Updated moved Charlie Sprite PR reports from docs_build/dev/reports/ to dev/reports/.
- Updated moved Charlie Sprite PR reports from dev/workspace/zip/ to dev/workspace/zips/.
- Left unrelated historical/report artifacts untouched, including docs_build/dev/reports/sprite-history-inventory.md.

## Files Intentionally Not Moved

- Product planning intended to remain in docs_build/
- Architecture documents intended to remain in docs_build/
- DDL, DML, and seed files
- Documentation intended to remain in docs_build/
- Runtime, Sprite Editor, DB/API/schema, and start_of_day files

## Validation Checklist

| Requirement | Result | Notes |
| --- | --- | --- |
| Batch governance mode reviewed | PASS | Read dev/build/ProjectInstructions/addendums/batch_governance_mode.md |
| Canonical artifact paths confirmed | PASS | Reports: dev/reports/; ZIPs: dev/workspace/zips/ |
| Generated Charlie Sprite reports moved out of docs_build/ | PASS | PR 022 through PR 039 reports moved |
| Legacy docs_build report aliases removed | PASS | Removed tracked codex_changed_files.txt and codex_review.diff from docs_build/dev/reports/ |
| References updated within Charlie work only | PASS | Updated moved Charlie Sprite report references only |
| No product planning, architecture, DDL, DML, seed, or intended docs_build docs moved | PASS | Scope limited to generated Charlie report artifacts |
| No runtime behavior changed | PASS | Changed-file scope is reports/artifacts only |
| No Sprite Editor functionality changed | PASS | No assets/toolbox or runtime source changes |
| No DB/API/schema files changed | PASS | Changed-file scope check passed |
| No start_of_day files changed | PASS | Changed-file scope check passed |

## Validation Lane

- PASS: `rg -n "docs_build/dev/reports|docs_build\\dev\\reports|dev/workspace/zip/" dev/reports -g "PR_26179_CHARLIE_0*.md" -g "!PR_26179_CHARLIE_040-dev-artifact-location-cleanup.md"` returned no matches.
- PASS: `git diff --name-only | rg -v "^(dev/reports/|docs_build/dev/reports/)"` returned no out-of-scope paths.
- PASS: `git diff --check` returned no whitespace errors. Git reported CRLF normalization warnings only for moved markdown reports.

## EOD Repair Note

- Rebased against current `origin/main` after PRs 022 through 039 were merged.
- Resolved generated report conflicts by regenerating `dev/reports/codex_changed_files.txt` and `dev/reports/codex_review.diff`.
- Preserved canonical paths: reports under `dev/reports/` and ZIPs under `dev/workspace/zips/`.
- Preserved obsolete tracked `docs_build/dev/reports/` Charlie report removals.

## Manual Validation Notes

- Confirmed this cleanup is artifact-only.
- Confirmed canonical report files now live under dev/reports/.
- Confirmed PR 040 ZIP will be generated under dev/workspace/zips/.
- Confirmed unrelated docs_build/dev/reports/sprite-history-inventory.md remains untouched.

## ZIP

- dev/workspace/zips/PR_26179_CHARLIE_040-dev-artifact-location-cleanup_delta.zip
