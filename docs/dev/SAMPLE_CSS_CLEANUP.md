Toolbox Aid
David Quesenberry
03/24/2026
SAMPLE_CSS_CLEANUP.md

# Sample CSS Cleanup

## Changes
- Replaced old stylesheet references with `baseLayout.css`
- Centralized shared styles in `engine/ui/baseLayout.css`

## Required Updates
All sample HTML files should use:

<link rel="stylesheet" href="../../engine/ui/baseLayout.css" />

## Notes
- Samples now use `engine/ui/baseLayout.css`
- No functional changes expected
