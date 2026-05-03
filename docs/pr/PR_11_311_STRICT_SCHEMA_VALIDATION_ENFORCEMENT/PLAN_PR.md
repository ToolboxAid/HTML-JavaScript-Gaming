# PLAN_PR_11_311

## Purpose
Enforce strict schema validation as the only acceptance path for workspace and tool JSON usage in Workspace V2.

## Scope
- `tools/workspace-v2/index.js`
- imports
- session loads
- tool entry/session activation path
- no schema file edits

## Steps
1. Remove auto-correction paths and fallback payload acceptance.
2. Validate tool payload shape before any activation/use.
3. Validate workspace manifest import before any state mutation.
4. Ensure session history/library loads reject invalid payloads.
5. Ensure explicit visible errors and no partial apply in import flow.
6. Run targeted syntax validation.
