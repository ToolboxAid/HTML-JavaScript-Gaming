# BUILD_PR_STYLE_08_ADAPTIVE_TOOL_DENSITY

## Purpose
Tighten the shared tool shell so tools use space more efficiently and avoid scrolling where practical, without redesigning the shell architecture.

## Single PR Purpose
Improve tool density and responsive rail sizing on top of the existing shared tool shell.

## Scope
- refine the shared tool-shell CSS only
- apply the refined shell to the tools already using the shared shell
- reduce excess padding, gaps, and oversized rails where safe
- avoid horizontal scrolling at normal desktop widths
- reduce vertical scrolling where practical
- keep the change narrow and testable

## Required Rules
1. Reuse the existing shared tool shell from STYLE_06 / STYLE_07.
2. Do not redesign tools or add new features.
3. Keep CSS Grid as the shell layout.
4. No embedded `<style>` blocks.
5. No inline `style=""`.
6. No JS-generated styling.
7. Keep theme/layout work under `src/engine/theme/`.

## Required Density Changes
### Rail sizing
- Replace fixed left/right rail widths with responsive `clamp()` sizing where appropriate.
- Keep:
  - left rail narrower but still usable
  - center as the primary flexible region
  - right rail usable for properties/readouts
- Do not let rails become unusably small.

### Spacing
- Reduce excessive shell gaps if present.
- Reduce excessive panel padding if present.
- Align all density changes to the shared spacing system.

### Scrolling
- Avoid horizontal scrolling at normal desktop widths.
- Reduce vertical scrolling where practical, especially for inspector/debug-style tools.
- Prefer better sizing and density over adding scrollbars.
- If scrolling remains necessary, keep it localized and justified.

## Validation Focus
Use the existing migrated tool set as validation targets, including tools with:
- left-side action controls
- center textareas/canvas/workspace
- right-side output/readout panels

## Acceptance
- shared tool shell remains CSS Grid based
- rail sizing becomes more adaptive
- tools feel denser and more usable
- horizontal scrolling remains avoided at normal desktop widths
- vertical scrolling is reduced where practical
- no embedded styling remains on migrated tool pages
- migrated tools remain functional
- change is visually testable
