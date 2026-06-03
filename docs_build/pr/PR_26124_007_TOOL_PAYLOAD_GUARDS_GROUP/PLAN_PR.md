# PLAN_PR — PR_26124_007

## Goal
Fix the next small group of failing tools (2 tools) from the Workspace V2 completion audit with minimal, low-risk changes.

## Tools in Scope
- `asset-manager-v2`
- `palette-manager-v2`

## Planned Fix Type
- Tighten pre-render payload contract validation with explicit cross-tool/legacy key rejection.
- No schema updates.
- No runtime feature additions.

## Planned Validation
- `node --check toolbox/asset-manager-v2/index.js`
- `node --check toolbox/palette-manager-v2/index.js`
- `npm run test:workspace-v2`
