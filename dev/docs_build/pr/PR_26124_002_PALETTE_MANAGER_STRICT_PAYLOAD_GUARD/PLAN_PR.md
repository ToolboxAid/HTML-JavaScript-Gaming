# PLAN_PR — PR_26124_002

## Goal
Fix the next failing tool from `tool_completion_audit.md` with a minimal single-tool change.

## Tool
- `palette-manager-v2`

## Scoped Issue
- Legacy palette payload key `payloadJson.paletteDocument.colors` must be rejected before render.

## Planned Change
1. Add an explicit pre-render validation guard in `toolbox/palette-manager-v2/index.js`:
   - reject `payloadJson.paletteDocument.colors`
   - show clear visible actionable error

## Out of Scope
- No schema edits
- No other tool edits
- No new features

## Validation
- `node --check toolbox/palette-manager-v2/index.js`
- `npm run test:workspace-v2`
