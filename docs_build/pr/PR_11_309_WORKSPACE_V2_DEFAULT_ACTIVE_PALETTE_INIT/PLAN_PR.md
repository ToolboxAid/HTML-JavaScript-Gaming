# PLAN_PR_11_309

## Purpose
Guarantee Workspace V2 manifest always has a single valid `tools.palette-browser` baseline during initialization and full reset.

## Scope
- `tools/workspace-v2/index.js`
- Workspace V2 initialization/full reset/export baseline only
- No schema changes

## Steps
1. Verify Workspace V2 initialization creates baseline active palette state when missing.
2. Verify full reset recreates baseline active palette state when missing.
3. Verify export path reads palette from the baseline source and emits `tools.palette-browser` safely.
4. Run targeted syntax validation.
5. Produce report and PR zip artifacts.
