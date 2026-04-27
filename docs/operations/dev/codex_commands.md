MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_2C_MANIFEST_PAYLOAD_EXPECTATION_TESTS_AND_CLEANUP.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_2C_MANIFEST_PAYLOAD_EXPECTATION_TESTS_AND_CLEANUP.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_2C_MANIFEST_PAYLOAD_EXPECTATION_TESTS_AND_CLEANUP.md.
3. Add a strict manifest payload expectation test.
4. Clean all game manifests:
   - remove root lineage
   - remove root sources
   - remove generic root assets
   - remove sourcePath fields
   - remove legacy JSON path references
5. Ensure palette is exactly:
   - tools["palette-browser"].palette
6. Ensure every tool section has metadata:
   - schema
   - version
   - name
   - source
7. Asteroids:
   - keep vector-asset-studio with actual vectors
   - remove sprite-editor if no actual sprite data
   - remove tile-map-editor if no actual tilemap data
   - remove parallax-editor if no actual parallax data
   - remove libraries if it is only reference/index metadata
8. Bouncing-ball:
   - remove lineage/sources/assets
   - keep palette-browser.palette
   - keep primitive-skin-editor.skins
9. Update Workspace Manager test if needed so it validates real payload sections, not shell load only.
10. Write reports:
   - docs/dev/reports/level_10_2c_manifest_payload_expectation_report.md
   - docs/dev/reports/level_10_2c_manifest_cleanup_report.md
11. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
12. Do not add validators.
13. Do not modify start_of_day.
14. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_2C_MANIFEST_PAYLOAD_EXPECTATION_TESTS_AND_CLEANUP_delta.zip

ACCEPTANCE:
- bad payload shape is test-covered
- manifests cleaned
- Asteroids vector tool has assets
- invalid unused tool sections removed
- delta ZIP exists
