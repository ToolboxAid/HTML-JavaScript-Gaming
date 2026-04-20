# BUILD_PR_STYLE_09_TOOL_HEIGHT_AND_VIEWPORT_FIT

## Purpose
Improve vertical fit for shared-shell tool pages so more of each tool is visible within the viewport and page-level scrolling is reduced.

## Single PR Purpose
Refine the existing shared tool shell to better use viewport height without redesigning tools or changing the shared width architecture.

## Scope
- refine the existing shared tool-shell CSS only
- apply the refined shell to the tools already migrated to the shared shell
- improve viewport-height usage
- reduce full-page vertical scrolling where practical
- keep changes narrow and testable
- do not redesign tools
- do not add new tool features

## Required Rules
1. Reuse the existing shared shell from STYLE_06 / STYLE_07 / STYLE_08.
2. Keep CSS Grid as the primary shell layout.
3. Preserve the adaptive density improvements from STYLE_08.
4. No embedded `<style>` blocks.
5. No inline `style=""`.
6. No JS-generated styling.
7. Keep theme/layout work under `src/engine/theme/`.
8. Do not stage folders in `<project folder>/tmp/`.
9. Output only the final ZIP to:
   `<project folder>/tmp/BUILD_PR_STYLE_09_TOOL_HEIGHT_AND_VIEWPORT_FIT.zip`

## Required Viewport-Fit Changes
### Shell height behavior
- Tool pages should better respect available viewport height.
- Reduce unnecessary full-page scrolling where practical.
- Avoid fake fixes that merely hide overflow without preserving usability.

### Panel height behavior
- Constrain tall readout/output regions intelligently.
- Localize scrolling to the panel level when needed rather than forcing whole-page scrolling.
- Keep primary interactive controls visible as much as practical.

### Vertical spacing
- Reduce unnecessary vertical gaps where safe.
- Reduce unnecessary vertical padding where safe.
- Preserve readability and usability.

## Validation Focus
Validate against the current migrated shell tools, including tools with:
- long readout/output regions
- textareas or large center regions
- multi-control left rails
- right-side inspector/output panels

## Acceptance
- shared shell remains CSS Grid based
- viewport-height usage improves
- page-level vertical scrolling is reduced where practical
- scrolling, where still needed, is localized and justified
- adaptive density improvements remain intact
- migrated tools remain functional
- no embedded styling remains on migrated tool pages
- change is visually testable
