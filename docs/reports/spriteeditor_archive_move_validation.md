# SpriteEditor Archive Move Validation v2

Generated: 2026-04-12

## Step 1: Old Path Does Not Exist
- Check: tools/SpriteEditor_old_keep/
- Result: PASS (path missing)

## Step 2: New Archive Path Exists With Identical Structure
- Check: docs/archive/tools/SpriteEditor_old_keep/
- New path exists: yes
- New path file count: 44
- New path directory count: 8
- New top-level folders: assets, modules, shared, themes
- Baseline from prior move report (before/after): 44/44
- Structure validation status: PASS
- Method: compare current archive tree counts to preserved move baseline; direct old-path filesystem diff is not possible because source path no longer exists.

## Step 3: Remaining References To Old Path
- Total old-path matches: 92
- Non-archive matches: 24 across 7 files
- Archive/historical matches: 68 across 21 files

### Non-Archive Matches (Exact)
- .\docs\dev\codex_commands.md:6:tools/SpriteEditor_old_keep/
- .\docs\dev\reports\spriteeditor_archive_move_report.md:6:- Source: tools/SpriteEditor_old_keep/
- .\docs\dev\reports\spriteeditor_archive_move_report.md:53:- Move-Item -LiteralPath tools/SpriteEditor_old_keep -Destination docs/archive/tools/SpriteEditor_old_keep
- .\docs\dev\reports\spriteeditor_archive_move_report.md:54:- rg -n -P (?<!docs/archive/)tools/SpriteEditor_old_keep docs --glob !docs/archive/**
- .\tools\shared\find-duplicate-methods\found_dupes_called_count.txt:110:   -> Line 12: \tools\SpriteEditor_old_keep\modules\integration\integrationRegistry.js
- .\tools\shared\find-duplicate-methods\found_dupes_called_count.txt:111:   -> Line 11: \tools\SpriteEditor_old_keep\modules\integration\systemIntegration.js
- .\tools\shared\find-duplicate-methods\found_dupes_called_count.txt:351:   -> Line 16: \tools\SpriteEditor_old_keep\modules\integration\integrationContracts.js
- .\tools\shared\find-duplicate-methods\found_dupes_called.txt:23:   -> Line 9: \tools\SpriteEditor_old_keep\main.js
- .\tools\shared\find-duplicate-methods\found_dupes_called.txt:298:   -> Line 16: \tools\SpriteEditor_old_keep\modules\integration\integrationContracts.js
- .\tools\shared\find-duplicate-methods\found_dupes_called.txt:757:   -> Line 12: \tools\SpriteEditor_old_keep\modules\integration\integrationRegistry.js
- .\tools\shared\find-duplicate-methods\found_dupes_called.txt:758:   -> Line 11: \tools\SpriteEditor_old_keep\modules\integration\systemIntegration.js
- .\tools\shared\find-duplicate-methods\find_duples_called.txt:149:   -> Line 16: \tools\SpriteEditor_old_keep\modules\integration\integrationContracts.js
- .\tools\shared\find-duplicate-methods\find_duples_called.txt:500:   -> Line 12: \tools\SpriteEditor_old_keep\modules\integration\integrationRegistry.js
- .\tools\shared\find-duplicate-methods\find_duples_called.txt:501:   -> Line 11: \tools\SpriteEditor_old_keep\modules\integration\systemIntegration.js
- .\docs\pr\BUILD_PR_TARGETED_REPO_CLEANUP_PASS_4B_SPRITEEDITOR_MOVE_TO_ARCHIVE.md:4:Move `tools/SpriteEditor_old_keep/` to `docs/archive/tools/SpriteEditor_old_keep/` as a non-executable reference artifact.
- .\docs\pr\BUILD_PR_TARGETED_REPO_CLEANUP_PASS_4B_SPRITEEDITOR_MOVE_TO_ARCHIVE.md:22:tools/SpriteEditor_old_keep/
- .\docs\pr\BUILD_PR_TARGETED_REPO_CLEANUP_PASS_4B_SPRITEEDITOR_MOVE_TO_ARCHIVE.md:29:  tools/SpriteEditor_old_keep/
- .\tools\dev\checkSharedExtractionGuard.baseline.json:1725:      "file": "tools/SpriteEditor_old_keep/modules/appCommands.js",
- .\tools\dev\checkSharedExtractionGuard.baseline.json:1730:      "file": "tools/SpriteEditor_old_keep/modules/appCommands.js",
- .\tools\dev\checkSharedExtractionGuard.baseline.json:1735:      "file": "tools/SpriteEditor_old_keep/modules/appIO.js",
- .\tools\dev\checkSharedExtractionGuard.baseline.json:1740:      "file": "tools/SpriteEditor_old_keep/modules/appPalette.js",
- .\tools\dev\checkSharedExtractionGuard.baseline.json:1745:      "file": "tools/SpriteEditor_old_keep/modules/appPalette.js",
- .\tools\dev\checkSharedExtractionGuard.baseline.json:1750:      "file": "tools/SpriteEditor_old_keep/modules/appPalette.js",
- .\tools\dev\checkSharedExtractionGuard.baseline.json:1755:      "file": "tools/SpriteEditor_old_keep/modules/integration/integrationContracts.js",

### Archive/Historical Match Files
- docs/archive\dev-ops\QC_click_by_click_test_script.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_REPO_CLEANUP_PHASE_1B_ENGINE_BOUNDARY_AND_DUPLICATE_HELPER_SCAN.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_POST_NORMALIZATION_EXTRACTION_GATE.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_REPO_CLEANUP_PHASE_1E_SPRITE_EDITOR_EXTRACTION_PILOT.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_REPO_CLEANUP_PHASE_1F_SPRITE_EDITOR_MULTI_EXTRACTION_AND_ENGINE_CANDIDATE.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_REPO_CLEANUP_PHASE_1G_ENGINE_PROMOTION_FROM_STRONG_CANDIDATES.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_TOOL_REGISTRY_VALIDATOR_AND_SPRITE_FIRST_CLASS.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_TOOL_THEME_AND_SHARED_SWATCH_WORKFLOW.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_TOOLS_AND_VECTOR_CONTRACT_COMBINED.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_TOOLS_FOLDER_CONSOLIDATION.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_TOOLS_INDEX_SURFACE_CLEANUP.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_TOOLS_REGISTRY_AND_SPRITE_RENAME.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_VECTOR_PLATFORM_SURFACE_POLISH.md
- docs/archive\pr\legacy-pr-history\BUILD_PR_VECTOR_SHOWCASE_AND_GEOMETRY_RUNTIME_FINAL.md
- docs/archive\pr\legacy-pr-history\PLAN_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_POST_NORMALIZATION_EXTRACTION_GATE.md
- docs/archive\pr\legacy-pr-history\PLAN_PR_REPO_CLEANUP_PHASE_1E_SPRITE_EDITOR_EXTRACTION_PILOT.md
- docs/archive\pr\legacy-pr-history\PLAN_PR_REPO_CLEANUP_PHASE_1F_SPRITE_EDITOR_MULTI_EXTRACTION_AND_ENGINE_CANDIDATE.md
- docs/archive\pr\legacy-pr-history\PLAN_PR_REPO_CLEANUP_PHASE_1G_ENGINE_PROMOTION_FROM_STRONG_CANDIDATES.md
- docs/archive\pr\legacy-pr-history\PLAN_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md
- docs/archive\pr\legacy-pr-history\PLAN_PR_TOOLS_CANONICAL_NAMING_AUDIT.md

## Step 4: Runtime Import References To Old Path
- Scan scope: tools, src, games, samples, tests
- Result: PASS (no runtime import/require/dynamic-import references to old path)

## Step 6: Broken References (Listed, Not Fixed)
- Potentially broken/stale old-path references were found.
- Non-archive references likely needing follow-up are listed above under "Non-Archive Matches (Exact)".
- Archive/historical references retained for provenance are listed above under "Archive/Historical Match Files".
- No fixes were applied in this validation pass.
