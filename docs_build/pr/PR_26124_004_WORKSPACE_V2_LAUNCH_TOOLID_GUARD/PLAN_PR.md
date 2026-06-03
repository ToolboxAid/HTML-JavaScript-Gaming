# PLAN_PR — PR_26124_004

## Goal
Fix the next failing Workspace V2 tool lane item with a minimal single-tool change.

## Target Tool
- `workspace-v2`

## Problem
- Launch flow could navigate to selected tool URL while active session payload belonged to a different `toolId`.
- This created invalid workspace launch attempts for mismatched tool/session pairs.

## Minimal Fix
1. Add a strict guard in `createSessionAndLaunch`:
   - block launch when `currentSessionPayload.toolId !== selectedToolId`
   - show clear visible actionable message before navigation
2. Keep all existing payload validation and launch behavior intact.

## Validation
- `node --check tools/workspace-v2/index.js`
- `npm run test:workspace-v2`
