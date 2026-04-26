
# BUILD_PR_LEVEL_20_24_PLACE_PAGER_AT_PLATFORM_SHELL_MARKER

## Purpose

Place the Workspace Manager pager EXACTLY at the developer-provided marker:

```js
// pager should go here
```

inside:

```
tools/shared/platformShell.js (around line 876)
```

## Critical Correction

Do NOT:
- guess placement
- search for Editors
- inject into index.html
- inject into mount container directly

DO:
- insert pager at the explicit marker location

## Scope

- Find marker: `// pager should go here`
- Replace that marker with pager render logic
- Ensure pager binds to existing tool host controls
- Ensure pager drives tool selection + mount

## Required Behavior

- Pager appears exactly where marker is
- No duplicate pagers exist
- No pager exists in index.html
- No pager exists in host shell top
- Pager controls:
  - [PREV]
  - <toolname>
  - [NEXT]

- On load:
  - first tool selected
  - tool mounted

- Prev/Next:
  - update tool
  - remount tool

## Forbidden

- DO NOT modify index.html structure
- DO NOT add new headers/banners
- DO NOT inject pager anywhere else
- DO NOT keep old pager
- DO NOT fallback to gameId||game
- DO NOT create second pager

## Validation

Create:
docs/dev/reports/platform_shell_pager_marker_validation.md

Must prove:
- marker found and replaced
- pager rendered at marker location
- no other pagers exist
- tool mounts correctly
