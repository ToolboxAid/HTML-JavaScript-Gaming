# PLAN_PR_11_189B_SVG_V2_SHARED_THEME_HEADER_CORRECTION

## Purpose
Correct the SVG Asset Studio v2 lane so the v2 tool uses the same shared theme header mount as `/index.html` and does not invent a separate collapsible header.

## Scope
- SVG Asset Studio v2 only.
- Single implementation file only.
- Single class only.
- No helper classes.
- No alias variables.
- No abstraction layers.
- No schema changes.
- No sample changes.
- No game changes.
- No Workspace Manager v1 work.
- No legacy tool patching.
- No platformShell usage.
- No `tools/shared/*` usage.

## Naming clarification
- `Palette Browser-v1`: existing legacy palette viewing tool. Do not modify it in this PR.
- `Palette Browser`: ambiguous unless the repo has a distinct v2 route using this exact name. Do not create or patch it in this PR.
- `Palette Manager`: the v2 session-backed replacement lane for palette inspection/management. It should follow the same v2 header rules in its own PR, not in this SVG PR.

## Required correction
SVG Asset Studio v2 must reuse the same visual header system as `/index.html` by mounting the shared theme header target:

```html
<div id="shared-theme-header"></div>
```

The tool page must then render its own v2 content below that mount. The header/title/image behavior must match `/index.html` styling and source conventions.

## Acceptance
- SVG Asset Studio v2 contains the shared header mount used by `/index.html`.
- The old ad-hoc `<details class="is-collapsible">` page-intro header is removed from SVG Asset Studio v2.
- SVG still reads session-backed data only.
- SVG still renders from explicit session context.
- Empty/error states still render without fallback data.
- No v1, platformShell, or workspace-v1 coupling is introduced.
