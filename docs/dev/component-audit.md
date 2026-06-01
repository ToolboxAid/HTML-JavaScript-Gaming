# Component Audit

## Shared Component Ownership

- `gamefoundrystudio.css` owns shared visuals for buttons, cards, badges/pills, accordions, toolbars, status/log blocks,
  tool columns, tool center panels, Tool Display Mode, navigation, submenu, and table wrappers.
- `controls.css` owns native HTML element sizing, spacing, scale, and typography defaults for controls.
- `pages.css` should remain page layout oriented and should consume color/tokens instead of defining new visual systems.

## Current Consolidation

Reusable color literals in page/component CSS now reference shared color variables from `colors.css`. Non-color design
values have a token home in `tokens.css` for future incremental cleanup.

## Follow-Up

Further consolidation can gradually replace repeated numeric spacing/radius values with the token scale. This PR does
not intentionally change visual layout or app behavior.
