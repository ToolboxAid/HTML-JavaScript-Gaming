# BUILD_PR_LEVEL_11_187_COMMIT_AND_RESTART_TOOL_V2_LANE

## Purpose
Create commit-ready restart instructions for the new Tool v2 migration lane after the failed legacy Workspace Manager/SVG debugging loop.

## Decision
Stop patching the old Workspace Manager/tool shell spaghetti.

Start a clean Tool v2 lane:

- Palette first
- session-backed shared data
- one tool at a time
- reverse engineer behavior
- do not copy old tool implementation code
- move legacy tools to `<tool>-v1`
- rebuild clean tools with consistent layout and shared CSS

## Hard Scope Rules
No changes to:

- schemas
- samples
- games
- runtime tool code

This PR is commit/restart documentation only. The lane it defines is architecture/tool cleanup only.

## Data Loading Rules
There are three supported data-load paths:

### 1. Workspace from URL
```text
Workspace Manager v2 URL
  -> loads manifest/data
  -> stores session context
  -> passes session/context id to tool
```

### 2. Tool from URL
```text
Tool URL
  -> loads explicit tool data from URL/preset path
  -> stores session context
  -> tool reads from session
```

### 3. Tool from session loaded by workspace
```text
Workspace Manager v2
  -> writes session context
  -> launches tool with hostContextId/session id
  -> tool reads session context
```

## Forbidden Data Paths
Do not use:

- platformShell for v2 hosted data
- assetUsageIntegration
- shared asset handoff
- shared palette handoff
- fallback/default samples
- guessed paths
- tool id aliases
- hidden data loading

## Reverse Engineering Rule
For every tool:

1. Inspect old tool.
2. Document behavior.
3. Document inputs/outputs.
4. Document UI sections.
5. Document what to keep conceptually.
6. Document what to discard.
7. Move old folder to `<tool>-v1`.
8. Build clean v2 folder from the documented behavior only.

Do not copy old implementation code.

## Next Execution Lane
Continue from PR 11.186 / 11.187 into:

```text
PR_11_188_PALETTE_V2_REVERSE_ENGINEER_AND_REBUILD
```

Expected next PR:
- inspect Palette Browser
- create reverse engineering report
- move `toolbox/Palette Browser/` to `toolbox/Palette Browser-v1/`
- create clean `toolbox/Palette Browser/`
- use session-backed data
- use common shared CSS
- no schema/sample/game changes
