# BUILD_PR_CODEX_AUTORUN_TOOLS_AND_VECTOR_CONTRACT

## Purpose
Execute the full sequence with **no manual intervention**:

1. Consolidate renamed/duplicate tool folders under `tools/`
2. Validate the repo after consolidation and repair any broken paths/imports/references caused by that consolidation
3. Produce the docs-first planning bundle for `PLAN_PR_VECTOR_ASSET_CONTRACT`

This PR bundle is intended for Codex execution only. The goal is to let Codex perform the implementation, validation, repair, and follow-on planning in one continuous pass.

## Scope
### In scope
- Tool-folder consolidation under `tools/`
- Canonical path selection for current tool folders
- File movement/merging into canonical tool folders
- Reference/path/import updates caused by consolidation
- Validation of launcher/index/tool/sample/asset/vector paths
- Repair of any broken paths caused by consolidation
- Creation of a docs-only `PLAN_PR_VECTOR_ASSET_CONTRACT` bundle
- Repo-structured ZIP outputs

### Explicit exclusions
- Legacy `old SpriteEditor` consolidation work
- Unrelated engine refactors
- Unrelated gameplay work
- New feature work outside path repair required by consolidation

## Required execution order
### Phase 1 — Consolidate tools folders
Codex must:
- inventory folders directly under `tools/`
- identify duplicate/renamed folders created by rename drift
- choose the canonical current folder for each tool based on newer approved naming
- merge/move files into canonical folders
- update repo references to canonical locations
- remove obsolete duplicate folders after validation
- ignore old SpriteEditor except for active path cleanup if absolutely necessary to keep the repo working

### Phase 2 — Validate and repair
Codex must perform validation and fix issues without requiring manual follow-up.

Validation must cover:
- launcher/index links
- Tile Map Editor
- Parallax Editor
- SVG Editor
- sample loading
- asset loading
- vector/SVG loading if referenced
- tile-map and parallax config/json path resolution
- no remaining required references to deprecated duplicate folders
- no remaining required references to old SpriteEditor

If broken references are found, Codex must fix them in the same pass.

### Phase 3 — Create docs-only vector asset contract plan
After Phase 1 and Phase 2 are complete, Codex must create:

- `docs/pr/PLAN_PR_VECTOR_ASSET_CONTRACT.md`
- `docs/operations/dev/codex_commands.md` (updated for the vector asset contract plan output)
- `docs/operations/dev/commit_comment.txt`
- `docs/reports/file_tree.txt`
- `docs/reports/change_summary.txt`
- `docs/reports/validation_checklist.txt`

The vector asset contract plan must define the future planning/documentation needed to lock:
- vector asset file contract
- coordinate system
- origin rules
- scaling rules
- stroke/fill rules
- palette/color binding rules
- layering/z-order rules
- metadata/extensibility rules
- tool/runtime ownership boundaries
- validation examples

## Deliverables for this combined Codex run
### Build/consolidation docs
- `docs/pr/BUILD_PR_TOOLS_FOLDER_CONSOLIDATION.md`
- `docs/reports/file_tree.txt`
- `docs/reports/change_summary.txt`
- `docs/reports/validation_checklist.txt`

### Follow-on plan docs
- `docs/pr/PLAN_PR_VECTOR_ASSET_CONTRACT.md`
- refreshed `docs/operations/dev/codex_commands.md`
- refreshed `docs/operations/dev/commit_comment.txt`

## Success criteria
- One canonical folder per active tool under `tools/`
- Duplicate rename-created folders removed after consolidation
- Old SpriteEditor ignored as legacy/out-of-scope except required path cleanup
- Active tool paths work from canonical names
- Samples/assets/configs load from canonical paths
- No manual cleanup step remains
- Vector asset contract planning bundle exists and is ready for the next Codex pass

## Output ZIP requirement
Codex should package outputs as repo-structured ZIPs at:

- `<project folder>/tmp/BUILD_PR_TOOLS_FOLDER_CONSOLIDATION.zip`
- `<project folder>/tmp/PLAN_PR_VECTOR_ASSET_CONTRACT.zip`

## Notes
This is a **no-manual** execution request.
Codex should complete all three parts in sequence:
1. build/consolidate
2. validate/repair
3. generate vector asset contract plan
