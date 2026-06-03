# PR_11_192_20260501_04 — V2 Tool HTML Shell Correction

## Purpose
Correct the V2 tool implementation direction so static page structure lives in `toolbox/<tool>-v2/index.html` and JavaScript stays behavior-only.

## Scope
- Palette Manager V2
- SVG Asset Studio V2
- Vector Map Editor V2 if present from the current lane

## Required correction
Each V2 tool must use:

```text
toolbox/<tool>-v2/index.html
  - static CSS links
  - <div id="shared-theme-header"></div>
  - static page shell
  - static menuTool/menuWorkspace containers
  - module script reference

toolbox/<tool>-v2/index.js
  - single class behavior
  - read session
  - validate contract
  - populate existing DOM nodes
  - render valid/empty/error states
```

## Forbidden
- Do not build body HTML inside JavaScript.
- Do not inject CSS from JavaScript.
- Do not append the shared header script dynamically from JavaScript.
- Do not overwrite `document.body.innerHTML`.
- Do not use non-V2 body dataset/tool ids for V2 entries.
- Do not copy/paste legacy tool implementation into V2.
- Do not touch schemas, samples, games, Workspace Manager v1, `platformShell`, or `toolbox/shared/*`.

## Acceptance
- `index.html` owns static shell and header mount.
- `index.js` owns behavior only.
- Header uses `<div id="shared-theme-header"></div>`.
- V2 names include `V2` visibly.
- Empty/error/valid states remain explicit and testable.
