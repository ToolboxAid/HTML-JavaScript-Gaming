# PR_11_192_20260501_01 — V2 Tool HTML Shell Correction

## Purpose
Correct the V2 tool implementation direction so static page structure lives in `tools/<tool>-v2/index.html` and JavaScript stays behavior-only.

## Scope
- Palette Manager V2
- SVG Asset Studio V2
- Vector Map Editor V2 if present from the current lane

## Required correction
Each V2 tool must use:

```text
tools/<tool>-v2/index.html
  - static CSS links
  - <div id="shared-theme-header"></div>
  - static page shell
  - static menuTool/menuWorkspace containers
  - module script reference

tools/<tool>-v2/index.js
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
- Do not use `palette-manager` for V2 body dataset/tool id.
- Do not touch schemas, samples, games, Workspace Manager v1, `platformShell`, or `tools/shared/*`.

## Acceptance
- `index.html` owns static shell and header mount.
- `index.js` owns behavior only.
- V2 tool id/name uses explicit `V2` naming and `*-v2` identifiers.
- Header mount is present as `<div id="shared-theme-header"></div>`.
- Empty/error/valid states remain testable through stable DOM ids.
