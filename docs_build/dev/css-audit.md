# CSS Audit

## Summary

- Added `src/engine/theme/v2/assets/css/colors.css` as the CSS color source of truth.
- Added `src/engine/theme/v2/assets/css/tokens.css` for non-color design tokens.
- Removed per-color CSS files under `src/engine/theme/v2/assets/css/colors/`.
- Removed the old JSON palette file because no runtime dependency was found.
- Updated `styles.css` import order so colors and tokens load before base/component/page CSS.

## Color Organization

`colors.css` is organized into:

- Theme Colors
- Surface Colors
- Text Colors
- Border Colors
- Tool Group Colors
- Status Colors

## Validation

Targeted CSS raw-color scan found raw CSS color values only in `colors.css`.

Long full smoke tests were skipped because this PR changes CSS organization and documentation, not runtime behavior.
