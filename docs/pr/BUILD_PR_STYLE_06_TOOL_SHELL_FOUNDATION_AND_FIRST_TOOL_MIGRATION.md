# BUILD_PR_STYLE_06_TOOL_SHELL_FOUNDATION_AND_FIRST_TOOL_MIGRATION

## Purpose
Create the shared full-width tool shell and apply it to one tool as the first proof migration.

## Single PR Purpose
Establish the common tool layout system:
- fixed left column
- flexible center column
- fixed right column
- full available page width
- only center grows/shrinks with viewport

## Scope
- add shared tool-shell styling under `src/engine/theme/`
- use the new shared theme approach only
- migrate one tool as the proof slice
- keep the change narrow and testable
- do not migrate multiple tools in this PR

## Required Layout Rules
1. Tool pages use full available page width.
2. Left rail width is fixed.
3. Right rail width is fixed.
4. Center workspace is flexible.
5. As page width changes:
   - left rail does not stretch
   - right rail does not stretch
   - center grows/shrinks
6. Header remains shared and visually consistent with the style system.
7. No embedded `<style>` blocks.
8. No inline `style=""`.
9. No JS-generated styling.

## Suggested CSS Shape
Use theme CSS only, likely under:
- `src/engine/theme/tools.css`
- shared support in `src/engine/theme/layout.css` or `main.css` only if needed

Example shell intent:
- `.tool-shell`
- `.tool-shell__left`
- `.tool-shell__center`
- `.tool-shell__right`

## Tool Selection
Choose one tool only as the proof migration.
Prefer the smallest active tool page that clearly demonstrates:
- left controls
- center workspace
- right details/properties or secondary panel

## Acceptance
- shared tool shell exists
- one tool uses the shared shell
- left and right columns remain fixed
- center resizes with viewport
- no embedded styling remains on the migrated tool page
- migrated tool remains functional
- change is visually testable
