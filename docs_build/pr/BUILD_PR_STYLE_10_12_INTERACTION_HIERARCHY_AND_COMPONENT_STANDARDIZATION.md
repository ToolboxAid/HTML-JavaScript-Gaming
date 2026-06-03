# BUILD_PR_STYLE_10_12_INTERACTION_HIERARCHY_AND_COMPONENT_STANDARDIZATION

## Purpose
Complete the next smallest safe grouped style slice after STYLE_07 by bundling STYLE_10 through STYLE_12 into one execution-backed PR.

## Single PR Purpose
Standardize how tools are used and read:
- interaction flow
- visual hierarchy/readability
- component consistency

This bundle intentionally groups only the tightly related layers that improve usability without changing broader theming strategy.

## Sequence Rule
- Complete the lowest unfinished STYLE first.
- This PR is valid only after STYLE_07 is complete.
- Do not start STYLE_13+ implementation work in this PR.
- Keep roadmap handling execution-backed and append-only.

## Included Style Items
- STYLE_10 — Interaction & Flow
- STYLE_11 — Visual Hierarchy & Readability
- STYLE_12 — Component Standardization

## Scope
- improve keyboard-first flow on migrated tools
- improve focus management and button/action state consistency
- improve heading/panel/label readability and grouping
- standardize buttons, inputs, labels, panels, and readout areas across migrated tools
- keep the shared shell/layout from STYLE_06–09 intact
- do not redesign tools
- do not start full color-system/theming work
- do not create per-tool forks unless required for functionality

## Required Rules
1. Preserve existing shared theme and tool shell foundations.
2. No embedded `<style>` blocks.
3. No inline `style=""`.
4. No JS-generated styling.
5. Keep layout changes minimal; this is not a shell redesign PR.
6. Keyboard/focus work must not introduce layout shift.
7. Component standardization must reuse shared theme files where possible.
8. Keep changes visually testable and narrow relative to the three bundled style items.

## STYLE_10 — Interaction & Flow
Implement on the already migrated tool set:
- primary actions accessible via Enter where appropriate
- Escape cancels/resets where appropriate
- logical tab flow across panels
- initial focus set correctly on load where appropriate
- focus preserved after actions where practical
- buttons reflect active/disabled state
- no layout shift during interaction

## STYLE_11 — Visual Hierarchy & Readability
Implement on the already migrated tool set:
- clear heading hierarchy
- consistent panel title spacing/size
- visually obvious section grouping
- consistent spacing rhythm across panels
- readable labels/helper text
- no clutter introduced by dense layouts

## STYLE_12 — Component Standardization
Implement on the already migrated tool set:
- buttons visually consistent
- inputs/textareas standardized
- labels consistently styled/aligned
- panels use common structure/spacing
- debug/readout areas visually consistent
- remove one-off component styling where safe

## Validation Targets
Use the existing migrated shell tools as the validation set:
- tools/State Inspector/index.html
- tools/Performance Profiler/index.html
- tools/Replay Visualizer/index.html
- tools/Physics Sandbox/index.html

## Acceptance
- STYLE_10 interaction behavior is execution-backed on migrated tools
- STYLE_11 readability improvements are visible and consistent
- STYLE_12 component consistency is visible across migrated tools
- no layout shell regression
- no inline/embedded styling added
- change remains visually testable
