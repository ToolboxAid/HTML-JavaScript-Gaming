# PR 11.187 Restart Notes

## Current State
The old Workspace Manager/SVG fix lane consumed too much time with little progress because legacy code paths are tangled:

- platformShell
- assetUsageIntegration
- shared handoff
- old click dispatch
- tool aliases
- inconsistent tool entry behavior

Manual testing proved that direct tool/session loading can work, so the remaining issue is orchestration and legacy tool consistency.

## New Direction
Do not keep fighting the old path.

Start Tool v2 migration:

1. Palette Browser / Manager first
2. SVG Asset Studio second
3. Vector Map Editor third
4. Tilemap Studio fourth
5. Continue one tool at a time

## Non-Negotiables
- no schema changes
- no sample changes
- no game changes
- no copied legacy implementation
- old tool folder moves to `-v1`
- new tool folder is clean
- session context is the only shared data source
- common CSS as much as possible

## Supported Data Load Paths
1. Workspace from URL -> session -> tool
2. Tool from URL -> session -> tool
3. Tool from workspace session

## Restart Command Block

```powershell
cd C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming
code .
git status
git pull
```

## Review Today's State

```powershell
git status
git diff --stat
```

## Commit Suggested Current Lane

Use this only after reviewing/accepting the generated PR docs:

```powershell
git add docs_build/pr docs_build/dev
git commit -m "Start Palette-first Tool v2 migration lane with session-backed contracts - PR 11.187"
```

## Next Codex Execution
Run the next PR from this baseline:

```text
PR_11_188_PALETTE_V2_REVERSE_ENGINEER_AND_REBUILD
```

## Next PR Constraints
- no schemas
- no samples
- no games
- reverse engineer first
- move Palette Browser to Palette Browser-v1
- create clean Palette Browser v2
- session-backed palette data
- shared CSS foundation

## Validation
- Runtime validation: not run.
- Full samples smoke: skipped.
- Reason: commit/restart documentation only; no schemas, samples, games, or runtime tool code were modified.
