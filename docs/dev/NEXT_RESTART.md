# NEXT RESTART - TOOL V2 MIGRATION

## Open repo

```powershell
cd C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming
code .
```

## Sync

```powershell
git status
git pull
```

## Current Decision

Stop patching legacy Workspace Manager/tool shell code.

Start clean Tool v2 lane:

```text
Palette first
Session-backed shared data
One tool at a time
Reverse engineer, do not copy
Move old tools to <tool>-v1
No schema/sample/game changes
```

## Supported load paths

```text
1. Workspace from URL -> load data -> session -> tool
2. Tool from URL -> load data -> session -> tool
3. Tool from session loaded by Workspace
```

## Next PR

```text
PR_11_188_PALETTE_V2_REVERSE_ENGINEER_AND_REBUILD
```

## Next PR must do

```text
Reverse engineer Palette Browser
Move tools/Palette Browser -> tools/Palette Browser-v1
Create clean tools/Palette Browser
Add/use shared CSS
Use session context only
No platformShell
No assetUsageIntegration
No shared handoff
No fallback data
No schema/sample/game changes
```
