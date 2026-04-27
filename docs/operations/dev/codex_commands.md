MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_2F_VECTOR_ASSET_PALETTE_PAINT_BINDING_FIX.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_2F_VECTOR_ASSET_PALETTE_PAINT_BINDING_FIX.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_2F_VECTOR_ASSET_PALETTE_PAINT_BINDING_FIX.md.
3. Inspect Gravity Well game manifest:
   - tools["palette-browser"].palette
   - tools["vector-asset-studio"].vectors
4. Inspect Workspace Manager to Vector Asset Studio data passing.
5. Inspect Vector Asset Studio palette/paint/stroke selection initialization.
6. Fix binding so shared palette loads into Vector Asset Studio selection state.
7. Ensure stroke-enabled vectors select a valid stroke swatch.
8. Add/adjust defaults in Gravity Well manifest only if style data is missing.
9. Add/update test coverage so palette loaded + vector asset present but palette/stroke selected false fails.
10. Write docs/dev/reports/level_10_2f_vector_asset_palette_paint_binding_report.md.
11. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
12. Do not add validators.
13. Do not modify start_of_day.
14. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_2F_VECTOR_ASSET_PALETTE_PAINT_BINDING_FIX_delta.zip

ACCEPTANCE:
- Gravity Well vector palette/stroke binding works
- test covers selection state
- delta ZIP exists
