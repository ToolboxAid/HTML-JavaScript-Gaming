# BUILD_PR_LEVEL_18_18_TRACK_F_DOCS_SYSTEM_COMPLETION

## Purpose
Complete Track F (Docs System Cleanup) with one executable, validation-backed PR that finishes the remaining roadmap work in this track.

## Execution-backed roadmap intent
This PR is allowed to advance only the following roadmap items when fully executed and validated:
- `consolidate duplicate docs` `[ ] -> [x]`
- `remove move-only historical docs (after validation)` `[ ] -> [x]`
- `align docs to feature-based structure` `[ ] -> [x]`
- `Track F - Docs System Cleanup` `[.] -> [x]`

Do not update any of the above unless the work is actually complete and validation proves it.

## Scope
Included:
- detect and consolidate duplicate or overlapping docs into clear primary docs
- remove move-only historical docs only after confirming their content already exists in the correct destination docs
- align docs layout to feature-based structure where classification/move work left transitional organization behind
- update internal doc references affected by consolidation or deletion
- produce explicit validation evidence
- preserve unrelated working-tree changes

Excluded:
- no implementation code
- no engine/shared/game/tool runtime changes
- no Track G cleanup
- no repo-wide empty-folder or `.keep` cleanup
- no roadmap text rewrite
- no deletion of roadmap content
- no deletion of docs that contain unique content
- no start_of_day changes

## Hard guards
- one PR purpose only: finish Track F
- smallest scoped valid change that can complete Track F
- docs-first
- deletion allowed only for move-only historical docs whose content is verified as preserved elsewhere
- when deleting a doc, record:
  - original path
  - destination authoritative doc
  - proof summary that content already exists there
- no vague wording
- no broad repo scan outside `docs/` unless needed only to repair doc references

## Required inputs
- current `docs/` tree
- current `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`
- prior Track F reports if present

## Required deliverables
Codex must create/update:
- `docs/dev/reports/BUILD_PR_LEVEL_18_18_TRACK_F_DOCS_SYSTEM_COMPLETION_DUPLICATE_MATRIX.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_18_TRACK_F_DOCS_SYSTEM_COMPLETION_DELETION_MAP.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_18_TRACK_F_DOCS_SYSTEM_COMPLETION_FEATURE_ALIGNMENT_MAP.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_18_TRACK_F_DOCS_SYSTEM_COMPLETION_REFERENCE_UPDATE_LOG.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_18_TRACK_F_DOCS_SYSTEM_COMPLETION_VALIDATION.md`

## Duplicate consolidation rules
- identify primary doc for each duplicate cluster
- merge missing unique content into the primary doc before any deletion
- if a secondary doc still contains unique content, it must not be deleted until merged
- prefer capability/feature docs over move-history docs as the authoritative destination
- prefer current bucket structure over transitional locations

## Historical move-only deletion rules
Delete a historical doc only if all are true:
1. it is move-only / rename-only / relocation-only history
2. it contains no unique operative guidance beyond what now exists in the authoritative destination
3. destination text exists before deletion
4. deletion is listed in the deletion map
5. validation confirms no unique content loss

## Feature-based alignment rules
- group docs so one capability can be reviewed from a coherent feature location
- minimize fragmentation caused by transitional move-map placement
- do not rewrite substantive guidance unless needed to preserve merged content
- keep roadmaps and reports in their governed locations

## Acceptance
- duplicate clusters are resolved into authoritative docs
- move-only historical docs removed only after preservation validation
- docs structure is aligned to feature-based review paths
- internal references updated and validated
- no unique doc content is lost
- no non-doc files changed except unavoidable doc reference touch points
- roadmap status updates are status-only and execution-backed
- Track F is complete when and only when all remaining Track F items are validated

## Validation requirements
Validation must include:
- duplicate cluster count and resolution list
- deleted historical doc count with one-to-one destination mapping
- proof that each deleted doc had no unique remaining content
- broken-reference check after changes
- confirmation that no start_of_day files changed
- confirmation that unrelated working-tree changes were preserved

## Roadmap update rules
Only status markers may change in `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` or the current repo roadmap path if moved during prior docs work.

Allowed transitions only if fully executed and validated:
- `consolidate duplicate docs` `[ ] -> [x]`
- `remove move-only historical docs (after validation)` `[ ] -> [x]`
- `align docs to feature-based structure` `[ ] -> [x]`
- `Track F - Docs System Cleanup` `[.] -> [x]`

Do not change any Track G items in this PR.
