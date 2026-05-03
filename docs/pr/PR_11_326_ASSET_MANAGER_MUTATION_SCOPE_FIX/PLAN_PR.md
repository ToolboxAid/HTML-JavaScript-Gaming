# PLAN_PR_11_326

## Purpose
Fix the next failing tool from the audit (`asset-manager-v2`) by removing unintended passive payload mutation while preserving launch and explicit add/remove behavior.

## Scope
- `tools/asset-manager-v2/index.js`
- `docs/pr/PR_11_326_ASSET_MANAGER_MUTATION_SCOPE_FIX/PLAN_PR.md`
- `docs/pr/PR_11_326_ASSET_MANAGER_MUTATION_SCOPE_FIX/BUILD_PR.md`
- `docs/dev/reports/PR_11_326_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Keep valid/invalid JSON contract handling unchanged.
2. Ensure workspace persistence is not performed during passive render/load.
3. Keep persistence tied to explicit asset modification actions.
4. Validate:
   - syntax check for changed tool file
   - target tool persistence behavior check
   - Workspace V2 Playwright gate
