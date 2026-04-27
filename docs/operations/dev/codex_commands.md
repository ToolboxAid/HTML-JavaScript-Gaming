MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_2B_WORKSPACE_MANAGER_PALETTE_BINDING_FIX.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_2B_WORKSPACE_MANAGER_PALETTE_BINDING_FIX.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_2B_WORKSPACE_MANAGER_PALETTE_BINDING_FIX.md.
3. Inspect Workspace Manager game manifest loading/binding code.
4. Find where shared palette is selected/displayed.
5. Bind shared palette from:
   - gameManifest.tools["palette-browser"].palette
6. Allow temporary fallback from root `palette` only for compatibility if present.
7. Do not create root palette objects.
8. Verify Bouncing-ball no longer shows:
   - Shared Palette: No shared palette selected
9. Run/update Level 10.2A Workspace Manager asset presence test.
10. Ensure direct game launch remains unchanged.
11. Write docs/dev/reports/level_10_2b_workspace_manager_palette_binding_report.md.
12. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
13. Do not add validators.
14. Do not modify start_of_day.
15. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_2B_WORKSPACE_MANAGER_PALETTE_BINDING_FIX_delta.zip

ACCEPTANCE:
- shared palette binds from palette-browser singleton palette
- Bouncing-ball palette appears
- delta ZIP exists
