# FINAL REPO CLEANUP + ROADMAP RENAME (V3)

## Purpose
Final safe cleanup with template protection, roadmap rename, and explicit archival of the legacy big-picture roadmap document with pointer updates.

## Scope
- remove empty directories EXCEPT:
  - games/_template/
  - any subfolders under games/_template/
- remove orphaned `.keep` files where safe
- clean docs residue
- rename roadmap file
- archive:
  - docs/archive/dev-ops/BIG_PICTURE_ROADMAP.md
- update all references/pointers that still target the archived big-picture roadmap
- preserve working-tree integrity

## Hard Guards
- DO NOT delete:
  - games/_template/
  - any directories inside games/_template/, even if empty
- DO NOT delete any file with unique content unless it is archived with a preserved destination
- archive must preserve discoverability
- rename and pointer updates must be atomic with validation

## Required Work
1. Empty directory cleanup with template exclusion.
2. Safe `.keep` cleanup outside protected template structure.
3. Rename:
   - docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md
   -> docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md
4. Archive:
   - docs/archive/dev-ops/BIG_PICTURE_ROADMAP.md
   into an appropriate archive location under docs/archive/
5. Update any pointers/references that still target:
   - docs/archive/dev-ops/BIG_PICTURE_ROADMAP.md
   so they resolve to the archived location or the authoritative current roadmap location, whichever is correct by context.
6. Produce validation and mapping reports.

## Required Reports
- docs/dev/reports/CLEANUP_EMPTY_DIRECTORIES.md
- docs/dev/reports/CLEANUP_KEEP_FILES.md
- docs/dev/reports/DOCS_RESIDUE_CLEANUP.md
- docs/dev/reports/ROADMAP_RENAME_REFERENCE_UPDATE.md
- docs/dev/reports/BIG_PICTURE_ROADMAP_ARCHIVE_MAP.md
- docs/dev/reports/FINAL_VALIDATION.md

## Acceptance
- no empty dirs remain outside protected template structure
- no unnecessary `.keep` files remain outside protected template structure
- docs tree is clean and navigable
- MASTER_ROADMAP_HIGH_LEVEL.md is renamed to MASTER_ROADMAP_ENGINE.md
- BIG_PICTURE_ROADMAP.md is archived, not lost
- all affected references are updated
- zero broken references remain
- validation report confirms clean repo state
