# PLAN_PR — PR_26124_008

## Goal
Fix the next small group of FAIL tools listed in `docs/dev/reports/tool_completion_audit.md`.

## Step 1: Extracted FAIL Tools (in order)
1. `workspace-v2`
2. `asset-manager-v2`
3. `palette-manager-v2`

## Scope
- Max 3 tools (selected all 3 extracted FAIL tools).
- No schema changes.
- No sample JSON changes.

## Planned Work
1. Apply minimal runtime fixes only inside the extracted tools.
2. Ensure per-tool contract behavior:
   - valid JSON loads
   - invalid JSON rejected before render with clear error
   - no fallback/default injection
   - payload handling remains deterministic
3. Update audit report statuses for fixed tools only.
4. Run required validation:
   - `npm run test:workspace-v2`
