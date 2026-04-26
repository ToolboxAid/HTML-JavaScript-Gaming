MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_9_7_REMOVE_INTERNAL_REFERENCES_AND_INLINE_DATA.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_9_7_REMOVE_INTERNAL_REFERENCES_AND_INLINE_DATA.md.
2. Read docs/pr/BUILD_PR_LEVEL_9_7_REMOVE_INTERNAL_REFERENCES_AND_INLINE_DATA.md.
3. Open `games/Asteroids/game.manifest.json`.
4. Remove internal pointer patterns:
   - runtimeSource
   - game.manifest.json#
   - #tools/
   - #tools.
   - source.path pointing back to this manifest
   - lineage.inlinedSourceFiles
   - lineage.toolDomains
5. Remove or restrict root assetCatalog:
   - no JSON-data entries
   - external binary/media paths only if retained
6. Preserve actual data under owning tool sections:
   - primitive-skin-editor
   - sprite-editor
   - tile-map-editor
   - parallax-editor
   - vector-asset-studio
   - asset-browser for external media only
7. Search for old deleted JSON filenames and remove stale references.
8. Verify:
   - only one JSON remains under games/Asteroids
   - no internal manifest fragment refs remain
   - no runtimeSource remains
   - Asteroids direct launch works
9. Update docs/dev/reports/level_9_7_remove_internal_references_report.md.
10. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
11. Do not add validators.
12. Do not modify start_of_day.
13. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_9_7_REMOVE_INTERNAL_REFERENCES_AND_INLINE_DATA_delta.zip

ACCEPTANCE:
- manifest is data, not pointer map
- Asteroids launches
- delta ZIP exists
