# PLAN_PR_11_325

## Purpose
Fix the first/highest-impact FAIL from the audit (`workspace-v2`) by restoring contract-valid Workspace V2 launch handling for `palette-manager-v2`.

## Scope
- `toolbox/workspace-v2/index.js`
- `docs_build/pr/PR_11_325_WORKSPACE_V2_PALETTE_LAUNCH_CONTRACT_FIX/PLAN_PR.md`
- `docs_build/pr/PR_11_325_WORKSPACE_V2_PALETTE_LAUNCH_CONTRACT_FIX/BUILD_PR.md`
- `docs_build/dev/reports/PR_11_325_report.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

## Steps
1. Remove Workspace V2 launch blocking that prevented palette manager tool launch.
2. Align Workspace V2 palette session contract handling to current payload shape:
   - `payloadJson.paletteDocument`
3. Keep changes limited to `workspace-v2` only.
4. Validate:
   - syntax check for changed file
   - previously failing case now passes
   - Playwright gate still passes
