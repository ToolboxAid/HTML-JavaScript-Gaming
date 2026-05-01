# SOD 2026-05-01.s1 - PR 11.188 Restart

## Open Repo

```powershell
cd C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming
code .
```

## Sync

```powershell
git status
git pull
```

## Direction Lock

```text
NO schema changes
NO sample changes
NO game changes
NO old Workspace Manager fixes
NO legacy tool patches
NO copying old code
NEW Tool v2 lane only
```

## Start PR

```text
PR_11_188_PALETTE_REVERSE_ENGINEER_AND_REBUILD
```

## Added Rules

```text
tools/shared/ is deprecated for new Tool v2 work
Use tools/common/ for new shared Tool v2 foundation
No code that is just one stream file
Controls should have focused classes/modules
Two menus: menuTool and menuWorkspace
Only controls for the current launch are visible
Workspace menu updates workspace/session only
Plan sidebar accordion control types before expanding UI
```

## Do Not Use

```text
platformShell
assetUsageIntegration
shared handoff
tool aliases
fallback data
default anything
Workspace ?tool= auto-open
```

## Launch Behavior

```text
Workspace opens clean
User selects Palette Browser / Manager
Workspace writes session
Palette Browser reads session via hostContextId
```
